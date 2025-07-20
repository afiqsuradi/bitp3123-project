package org.courtbook.desktop.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Booking {
    private int id;
    @JsonProperty("userId")
    private int userId;
    @JsonProperty("courtId")
    private int courtId;
    @JsonProperty("startTime")
    private String startTime;
    @JsonProperty("endTime")
    private String endTime;
    private String status;
    
    // Navigation properties
    private User user;
    private Court court;

    // Constructors
    public Booking() {}

    public Booking(int id, int userId, int courtId, String startTime, String endTime, String status) {
        this.id = id;
        this.userId = userId;
        this.courtId = courtId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getCourtId() { return courtId; }
    public void setCourtId(int courtId) { this.courtId = courtId; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Court getCourt() { return court; }
    public void setCourt(Court court) { this.court = court; }

    // Helper methods
    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isConfirmed() {
        return "CONFIRMED".equals(status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(status);
    }

    public String getFormattedStartTime() {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(startTime.replace("Z", ""));
            return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (Exception e) {
            return startTime;
        }
    }

    public String getFormattedEndTime() {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(endTime.replace("Z", ""));
            return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (Exception e) {
            return endTime;
        }
    }

    @Override
    public String toString() {
        return "Booking{id=" + id + ", userId=" + userId + ", courtId=" + courtId + 
               ", startTime='" + startTime + "', endTime='" + endTime + "', status='" + status + "'}";
    }
}
