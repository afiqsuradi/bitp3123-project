package org.courtbook.desktop.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.courtbook.desktop.models.Booking;
import org.courtbook.desktop.models.Court;
import org.courtbook.desktop.models.User;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class ApiService {
    private static final String API_BASE_URL = "https://courtbook-rest.azurewebsites.net/api";
    private final OkHttpClient client;
    private final ObjectMapper objectMapper;
    private String authToken; // Store the auth token for subsequent requests

    public ApiService() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .cookieJar(new SimpleCookieJar())
                .build();
        this.objectMapper = new ObjectMapper();
    }

    // Simple cookie jar implementation
    private static class SimpleCookieJar implements CookieJar {
        private final Map<String, List<Cookie>> cookieStore = new HashMap<>();

        @Override
        public void saveFromResponse(HttpUrl url, List<Cookie> cookies) {
            cookieStore.put(url.host(), cookies);
        }

        @Override
        public List<Cookie> loadForRequest(HttpUrl url) {
            List<Cookie> cookies = cookieStore.get(url.host());
            return cookies != null ? cookies : new ArrayList<>();
        }
    }

    // Helper method to create authenticated request builder
    private Request.Builder createAuthenticatedRequestBuilder() {
        Request.Builder builder = new Request.Builder();
        if (authToken != null && !authToken.isEmpty()) {
            builder.addHeader("Authorization", "Bearer " + authToken);
            System.out.println("Adding Authorization header: Bearer " + authToken.substring(0, Math.min(20, authToken.length())) + "...");
        } else {
            System.out.println("Warning: No auth token available for authenticated request");
        }
        return builder;
    }

    public User login(String email, String password) throws IOException, ApiException {
        String json = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(API_BASE_URL + "/auth/login")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            if (!response.isSuccessful()) {
                String message = jsonNode.has("message") ? jsonNode.get("message").asText() : "Login failed";
                throw new ApiException(message, response.code());
            }
            System.out.println( "Login response: " + responseBody );
            if (jsonNode.has("data") && jsonNode.get("data").has("user")) {
                JsonNode userData = jsonNode.get("data").get("user");
                User user = objectMapper.treeToValue(userData, User.class);
                
                // Extract and store the refresh_token for Authorization header
                if (userData.has("refresh_token")) {
                    this.authToken = userData.get("refresh_token").asText();
                    System.out.println("Stored auth token: " + this.authToken);
                }
                
                return user;
            }

            throw new ApiException("Invalid response format", 500);
        }
    }

    public User getCurrentUser() throws IOException, ApiException {
        Request request = createAuthenticatedRequestBuilder()
                .url(API_BASE_URL + "/auth/me")
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            System.out.println("getCurrentUser response: " + responseBody);

            if (!response.isSuccessful()) {
                String message = jsonNode.has("message") ? jsonNode.get("message").asText() : "Failed to get user";
                throw new ApiException(message, response.code());
            }

            if (jsonNode.has("data") && jsonNode.get("data").has("user")) {
                JsonNode userData = jsonNode.get("data").get("user");
                return objectMapper.treeToValue(userData, User.class);
            }

            throw new ApiException("Invalid response format", 500);
        }
    }

    public List<Court> getCourts() throws IOException, ApiException {
        Request request = createAuthenticatedRequestBuilder()
                .url(API_BASE_URL + "/courts")
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            System.out.println("getCourts response: " + responseBody);

            if (!response.isSuccessful()) {
                String message = jsonNode.has("message") ? jsonNode.get("message").asText() : "Failed to fetch courts";
                throw new ApiException(message, response.code());
            }

            List<Court> courts = new ArrayList<>();
            if (jsonNode.has("data") && jsonNode.get("data").has("courts")) {
                JsonNode courtsArray = jsonNode.get("data").get("courts");
                for (JsonNode courtNode : courtsArray) {
                    courts.add(objectMapper.treeToValue(courtNode, Court.class));
                }
            }

            return courts;
        }
    }

    public List<Booking> getAllBookings(Integer courtId, String status) throws IOException, ApiException {
        HttpUrl.Builder urlBuilder = HttpUrl.parse(API_BASE_URL + "/courts/bookings").newBuilder();
        
        if (courtId != null) {
            urlBuilder.addQueryParameter("courtId", courtId.toString());
        }
        if (status != null && !status.equals("ALL")) {
            urlBuilder.addQueryParameter("status", status);
        }

        Request request = createAuthenticatedRequestBuilder()
                .url(urlBuilder.build())
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            System.out.println("getAllBookings response: " + responseBody);

            if (!response.isSuccessful()) {
                String message = jsonNode.has("message") ? jsonNode.get("message").asText() : "Failed to fetch bookings";
                throw new ApiException(message, response.code());
            }

            List<Booking> bookings = new ArrayList<>();
            if (jsonNode.has("data") && jsonNode.get("data").has("bookings")) {
                JsonNode bookingsArray = jsonNode.get("data").get("bookings");
                for (JsonNode bookingNode : bookingsArray) {
                    Booking booking = objectMapper.treeToValue(bookingNode, Booking.class);
                    
                    // Parse user and court information
                    if (bookingNode.has("user")) {
                        User user = objectMapper.treeToValue(bookingNode.get("user"), User.class);
                        booking.setUser(user);
                    }
                    if (bookingNode.has("court")) {
                        Court court = objectMapper.treeToValue(bookingNode.get("court"), Court.class);
                        booking.setCourt(court);
                    }
                    
                    bookings.add(booking);
                }
            }

            return bookings;
        }
    }

    public void updateBookingStatus(int bookingId, String newStatus) throws IOException, ApiException {
        String json = String.format("{\"status\":\"%s\"}", newStatus);
        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

        Request request = createAuthenticatedRequestBuilder()
                .url(API_BASE_URL + "/courts/bookings/" + bookingId)
                .put(body)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            System.out.println("updateBookingStatus response: " + responseBody);
            
            if (!response.isSuccessful()) {
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                String message = jsonNode.has("message") ? jsonNode.get("message").asText() : "Failed to update booking";
                throw new ApiException(message, response.code());
            }
        }
    }

    public void logout() throws IOException, ApiException {
        Request request = createAuthenticatedRequestBuilder()
                .url(API_BASE_URL + "/auth/logout")
                .post(RequestBody.create("", MediaType.get("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            // Clear the auth token regardless of response
            this.authToken = null;
            // Don't throw exception even if logout fails on server side
            // Just clear local session
        }
    }

    public static class ApiException extends Exception {
        private final int statusCode;

        public ApiException(String message, int statusCode) {
            super(message);
            this.statusCode = statusCode;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }
}
