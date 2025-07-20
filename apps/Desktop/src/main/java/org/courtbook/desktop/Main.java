package org.courtbook.desktop;

import org.courtbook.desktop.models.User;
import org.courtbook.desktop.services.ApiService;
import org.courtbook.desktop.ui.AdminPanel;
import org.courtbook.desktop.ui.LoginDialog;

import javax.swing.*;
import java.awt.*;

public class Main {
    public static void main(String[] args) {
        // Ensure we're running on the EDT
        SwingUtilities.invokeLater(() -> {
            new Main().start();
        });
    }

    private void start() {
        ApiService apiService = new ApiService();
        
        // Try to get current user (if already logged in)
        try {
            User user = apiService.getCurrentUser();
            if (user != null && user.isAdmin()) {
                // User is already logged in and is admin, show admin panel
                showAdminPanel(apiService, user);
                return;
            }
        } catch (Exception e) {
            // User not logged in or error, proceed with login dialog
        }

        // Show login dialog
        showLoginDialog(apiService);
    }

    private void showLoginDialog(ApiService apiService) {
        LoginDialog loginDialog = new LoginDialog(null, apiService);
        loginDialog.setVisible(true);

        if (loginDialog.isLoginSuccessful()) {
            User user = loginDialog.getLoggedInUser();
            showAdminPanel(apiService, user);
        } else {
            // User closed login dialog without logging in
            System.exit(0);
        }
    }

    private void showAdminPanel(ApiService apiService, User user) {
        AdminPanel adminPanel = new AdminPanel(apiService, user);
        adminPanel.setVisible(true);
    }
}
