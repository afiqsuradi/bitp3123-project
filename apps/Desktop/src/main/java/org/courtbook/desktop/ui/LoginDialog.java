package org.courtbook.desktop.ui;

import org.courtbook.desktop.models.User;
import org.courtbook.desktop.services.ApiService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;

public class LoginDialog extends JDialog {
    private JTextField emailField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JLabel messageLabel;
    private ApiService apiService;
    private User loggedInUser;
    private boolean loginSuccessful = false;

    public LoginDialog(Frame parent, ApiService apiService) {
        super(parent, "CourtBook - Admin Login", true);
        this.apiService = apiService;
        initializeComponents();
        setupLayout();
        setupEventListeners();
    }

    private void initializeComponents() {
        emailField = new JTextField(20);
        passwordField = new JPasswordField(20);
        loginButton = new JButton("Login");
        messageLabel = new JLabel(" ");
        messageLabel.setForeground(Color.RED);
        
        // Set default values for testing
        emailField.setText("");
        passwordField.setText("");
    }

    private void setupLayout() {
        setLayout(new BorderLayout());
        
        JPanel mainPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        
        // Title
        JLabel titleLabel = new JLabel("Admin Login");
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 18f));
        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2; gbc.insets = new Insets(10, 10, 20, 10);
        mainPanel.add(titleLabel, gbc);
        
        // Email
        gbc.gridx = 0; gbc.gridy = 1; gbc.gridwidth = 1; gbc.insets = new Insets(5, 10, 5, 5);
        mainPanel.add(new JLabel("Email:"), gbc);
        gbc.gridx = 1; gbc.insets = new Insets(5, 5, 5, 10);
        mainPanel.add(emailField, gbc);
        
        // Password
        gbc.gridx = 0; gbc.gridy = 2; gbc.insets = new Insets(5, 10, 5, 5);
        mainPanel.add(new JLabel("Password:"), gbc);
        gbc.gridx = 1; gbc.insets = new Insets(5, 5, 5, 10);
        mainPanel.add(passwordField, gbc);
        
        // Login button
        gbc.gridx = 0; gbc.gridy = 3; gbc.gridwidth = 2; gbc.insets = new Insets(20, 10, 10, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        mainPanel.add(loginButton, gbc);
        
        // Message label
        gbc.gridy = 4; gbc.insets = new Insets(5, 10, 10, 10);
        mainPanel.add(messageLabel, gbc);
        
        add(mainPanel, BorderLayout.CENTER);
        
        pack();
        setLocationRelativeTo(getParent());
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
    }

    private void setupEventListeners() {
        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                performLogin();
            }
        });

        // Enter key support
        KeyStroke enterKey = KeyStroke.getKeyStroke("ENTER");
        getRootPane().registerKeyboardAction(e -> performLogin(), enterKey, JComponent.WHEN_IN_FOCUSED_WINDOW);
    }

    private void performLogin() {
        String email = emailField.getText().trim();
        String password = new String(passwordField.getPassword());

        if (email.isEmpty() || password.isEmpty()) {
            showMessage("Please enter both email and password.", Color.RED);
            return;
        }

        loginButton.setEnabled(false);
        loginButton.setText("Logging in...");

        // Perform login in background thread
        SwingWorker<User, Void> worker = new SwingWorker<User, Void>() {
            @Override
            protected User doInBackground() throws Exception {
                return apiService.login(email, password);
            }

            @Override
            protected void done() {
                loginButton.setEnabled(true);
                loginButton.setText("Login");

                try {
                    User user = get();
                    
                    if (!user.isAdmin()) {
                        showMessage("Access denied. Admin role required.", Color.RED);
                        return;
                    }

                    loggedInUser = user;
                    loginSuccessful = true;
                    dispose();
                    
                } catch (Exception ex) {
                    String message = "Login failed: ";
                    if (ex.getCause() instanceof ApiService.ApiException) {
                        ApiService.ApiException apiEx = (ApiService.ApiException) ex.getCause();
                        if (apiEx.getStatusCode() == 401) {
                            message += "Invalid credentials";
                        } else {
                            message += apiEx.getMessage();
                        }
                    } else {
                        message += ex.getMessage();
                    }
                    showMessage(message, Color.RED);
                }
            }
        };

        worker.execute();
    }

    private void showMessage(String message, Color color) {
        messageLabel.setText(message);
        messageLabel.setForeground(color);
    }

    public User getLoggedInUser() {
        return loggedInUser;
    }

    public boolean isLoginSuccessful() {
        return loginSuccessful;
    }
}
