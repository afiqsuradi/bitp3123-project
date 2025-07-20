package org.courtbook.desktop.ui;

import org.courtbook.desktop.models.Booking;
import org.courtbook.desktop.models.Court;
import org.courtbook.desktop.models.User;
import org.courtbook.desktop.services.ApiService;

import javax.swing.*;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.DefaultTableCellRenderer;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public class AdminPanel extends JFrame {
    private ApiService apiService;
    private User currentUser;
    private JTable bookingsTable;
    private BookingsTableModel tableModel;
    private JComboBox<CourtOption> courtFilter;
    private JComboBox<String> statusFilter;
    private JButton refreshButton;
    private JButton logoutButton;
    private JLabel statusLabel;

    private List<Court> courts;
    private List<Booking> bookings;

    public AdminPanel(ApiService apiService, User user) {
        this.apiService = apiService;
        this.currentUser = user;
        this.courts = new ArrayList<>();
        this.bookings = new ArrayList<>();
        
        initializeComponents();
        setupLayout();
        setupEventListeners();
        loadInitialData();
    }

    private void initializeComponents() {
        setTitle("CourtBook Admin Panel - " + currentUser.getName());
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        // Table
        tableModel = new BookingsTableModel();
        bookingsTable = new JTable(tableModel);
        setupTable();
        
        // Filters
        courtFilter = new JComboBox<>();
        courtFilter.addItem(new CourtOption(null, "All Courts"));
        
        statusFilter = new JComboBox<>(new String[]{"ALL", "PENDING", "CONFIRMED", "CANCELLED"});
        statusFilter.setSelectedItem("ALL");
        
        // Buttons
        refreshButton = new JButton("Refresh");
        logoutButton = new JButton("Logout");
        
        // Status label
        statusLabel = new JLabel("Loading...");
    }

    private void setupTable() {
        bookingsTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        bookingsTable.setRowHeight(30);
        
        // Set column widths
        bookingsTable.getColumnModel().getColumn(0).setPreferredWidth(80);  // ID
        bookingsTable.getColumnModel().getColumn(1).setPreferredWidth(200); // User
        bookingsTable.getColumnModel().getColumn(2).setPreferredWidth(150); // Court
        bookingsTable.getColumnModel().getColumn(3).setPreferredWidth(150); // Start Time
        bookingsTable.getColumnModel().getColumn(4).setPreferredWidth(150); // End Time
        bookingsTable.getColumnModel().getColumn(5).setPreferredWidth(100); // Status
        bookingsTable.getColumnModel().getColumn(6).setPreferredWidth(180); // Actions - increased width
        
        // Custom renderer for status column
        bookingsTable.getColumnModel().getColumn(5).setCellRenderer(new StatusCellRenderer());
        
        // Custom renderer for actions column
        bookingsTable.getColumnModel().getColumn(6).setCellRenderer(new ActionCellRenderer());
        bookingsTable.getColumnModel().getColumn(6).setCellEditor(new ActionCellEditor());
    }

    private void setupLayout() {
        setLayout(new BorderLayout());
        
        // Top panel with filters
        JPanel topPanel = new JPanel(new BorderLayout());
        
        JPanel filtersPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        filtersPanel.add(new JLabel("Court:"));
        filtersPanel.add(courtFilter);
        filtersPanel.add(Box.createHorizontalStrut(20));
        filtersPanel.add(new JLabel("Status:"));
        filtersPanel.add(statusFilter);
        filtersPanel.add(Box.createHorizontalStrut(20));
        filtersPanel.add(refreshButton);
        
        JPanel userPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        userPanel.add(new JLabel("Welcome, " + currentUser.getName()));
        userPanel.add(logoutButton);
        
        topPanel.add(filtersPanel, BorderLayout.WEST);
        topPanel.add(userPanel, BorderLayout.EAST);
        
        // Center panel with table
        JScrollPane scrollPane = new JScrollPane(bookingsTable);
        scrollPane.setPreferredSize(new Dimension(1000, 500));
        
        // Bottom panel with status
        JPanel bottomPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        bottomPanel.add(statusLabel);
        
        add(topPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
        add(bottomPanel, BorderLayout.SOUTH);
        
        pack();
        setLocationRelativeTo(null);
    }

    private void setupEventListeners() {
        refreshButton.addActionListener(e -> loadBookings());
        
        courtFilter.addActionListener(e -> loadBookings());
        statusFilter.addActionListener(e -> loadBookings());
        
        logoutButton.addActionListener(e -> logout());
    }

    private void loadInitialData() {
        SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                // Load courts
                courts = apiService.getCourts();
                return null;
            }

            @Override
            protected void done() {
                try {
                    get(); // Check for exceptions
                    
                    // Update court filter
                    for (Court court : courts) {
                        courtFilter.addItem(new CourtOption(court.getId(), court.getName()));
                    }
                    
                    // Load bookings
                    loadBookings();
                    
                } catch (Exception ex) {
                    showError("Failed to load initial data: " + ex.getMessage());
                }
            }
        };
        
        worker.execute();
    }

    private void loadBookings() {
        statusLabel.setText("Loading bookings...");
        refreshButton.setEnabled(false);
        
        SwingWorker<List<Booking>, Void> worker = new SwingWorker<List<Booking>, Void>() {
            @Override
            protected List<Booking> doInBackground() throws Exception {
                CourtOption selectedCourt = (CourtOption) courtFilter.getSelectedItem();
                String selectedStatus = (String) statusFilter.getSelectedItem();
                
                Integer courtId = selectedCourt != null ? selectedCourt.getId() : null;
                return apiService.getAllBookings(courtId, selectedStatus);
            }

            @Override
            protected void done() {
                refreshButton.setEnabled(true);
                
                try {
                    bookings = get();
                    tableModel.fireTableDataChanged();
                    statusLabel.setText("Loaded " + bookings.size() + " bookings");
                    
                } catch (Exception ex) {
                    showError("Failed to load bookings: " + ex.getMessage());
                    statusLabel.setText("Error loading bookings");
                }
            }
        };
        
        worker.execute();
    }

    private void confirmBooking(int bookingId) {
        SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                apiService.updateBookingStatus(bookingId, "CONFIRMED");
                return null;
            }

            @Override
            protected void done() {
                try {
                    get(); // Check for exceptions
                    loadBookings(); // Refresh the table
                    
                } catch (Exception ex) {
                    showError("Failed to confirm booking: " + ex.getMessage());
                }
            }
        };
        
        worker.execute();
    }
    
    private void cancelBooking(int bookingId) {
        SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                apiService.updateBookingStatus(bookingId, "CANCELLED");
                return null;
            }

            @Override
            protected void done() {
                try {
                    get(); // Check for exceptions
                    loadBookings(); // Refresh the table
                    
                } catch (Exception ex) {
                    showError("Failed to cancel booking: " + ex.getMessage());
                }
            }
        };
        
        worker.execute();
    }

    private void logout() {
        int option = JOptionPane.showConfirmDialog(this, 
            "Are you sure you want to logout?", 
            "Confirm Logout", 
            JOptionPane.YES_NO_OPTION);
        
        if (option == JOptionPane.YES_OPTION) {
            dispose();
            System.exit(0);
        }
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Error", JOptionPane.ERROR_MESSAGE);
    }

    // Table Model
    private class BookingsTableModel extends AbstractTableModel {
        private final String[] columnNames = {"ID", "User", "Court", "Start Time", "End Time", "Status", "Actions"};

        @Override
        public int getRowCount() {
            return bookings.size();
        }

        @Override
        public int getColumnCount() {
            return columnNames.length;
        }

        @Override
        public String getColumnName(int column) {
            return columnNames[column];
        }

        @Override
        public Object getValueAt(int rowIndex, int columnIndex) {
            if (rowIndex >= bookings.size()) return null;
            
            Booking booking = bookings.get(rowIndex);
            switch (columnIndex) {
                case 0: return "#" + booking.getId();
                case 1: return booking.getUser() != null ? 
                    booking.getUser().getName() + "\n" + booking.getUser().getEmail() : "N/A";
                case 2: return booking.getCourt() != null ? booking.getCourt().getName() : "N/A";
                case 3: return booking.getFormattedStartTime();
                case 4: return booking.getFormattedEndTime();
                case 5: return booking.getStatus();
                case 6: return booking; // Pass the booking object for actions
                default: return null;
            }
        }

        @Override
        public boolean isCellEditable(int rowIndex, int columnIndex) {
            return columnIndex == 6; // Only actions column is editable
        }
    }

    // Status Cell Renderer
    private class StatusCellRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, 
                boolean isSelected, boolean hasFocus, int row, int column) {
            
            super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
            
            String status = (String) value;
            switch (status) {
                case "PENDING":
                    setBackground(new Color(255, 248, 220)); // Light yellow
                    setForeground(Color.ORANGE.darker());
                    break;
                case "CONFIRMED":
                    setBackground(new Color(220, 255, 220)); // Light green
                    setForeground(Color.GREEN.darker());
                    break;
                case "CANCELLED":
                    setBackground(new Color(255, 220, 220)); // Light red
                    setForeground(Color.RED.darker());
                    break;
                default:
                    setBackground(table.getBackground());
                    setForeground(table.getForeground());
            }
            
            return this;
        }
    }

    // Action Cell Renderer
    private class ActionCellRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, 
                boolean isSelected, boolean hasFocus, int row, int column) {
            
            if (value instanceof Booking booking) {
                JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 2, 2));
                
                if (booking.isPending()) {
                    JButton confirmButton = new JButton("Confirm");
                    confirmButton.setPreferredSize(new Dimension(75, 25));
                    confirmButton.setFont(new Font("Arial", Font.PLAIN, 10));
                    panel.add(confirmButton);
                    
                    JButton cancelButton = new JButton("Cancel");
                    cancelButton.setPreferredSize(new Dimension(75, 25));
                    cancelButton.setFont(new Font("Arial", Font.PLAIN, 10));
                    panel.add(cancelButton);
                } else {
                    JLabel noActionLabel = new JLabel("No actions");
                    noActionLabel.setForeground(Color.GRAY);
                    panel.add(noActionLabel);
                }
                
                return panel;
            }
            
            return super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
        }
    }

    // Action Cell Editor
    private class ActionCellEditor extends AbstractCellEditor implements javax.swing.table.TableCellEditor {
        private JPanel panel;
        private Booking currentBooking;

        public ActionCellEditor() {
            panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 2, 2));
        }

        @Override
        public Component getTableCellEditorComponent(JTable table, Object value, 
                boolean isSelected, int row, int column) {
            
            panel.removeAll();
            
            if (value instanceof Booking booking) {
                currentBooking = booking;
                
                if (booking.isPending()) {
                    JButton confirmButton = new JButton("Confirm");
                    confirmButton.setPreferredSize(new Dimension(75, 25));
                    confirmButton.setFont(new Font("Arial", Font.PLAIN, 10));
                    confirmButton.addActionListener(e -> {
                        confirmBooking(booking.getId());
                        stopCellEditing();
                    });
                    panel.add(confirmButton);
                    
                    JButton cancelButton = new JButton("Cancel");
                    cancelButton.setPreferredSize(new Dimension(75, 25));
                    cancelButton.setFont(new Font("Arial", Font.PLAIN, 10));
                    cancelButton.addActionListener(e -> {
                        cancelBooking(booking.getId());
                        stopCellEditing();
                    });
                    panel.add(cancelButton);
                } else {
                    JLabel noActionLabel = new JLabel("No actions");
                    noActionLabel.setForeground(Color.GRAY);
                    panel.add(noActionLabel);
                }
            }
            
            return panel;
        }

        @Override
        public Object getCellEditorValue() {
            return currentBooking;
        }
    }

    // Court Option Helper Class
    private static class CourtOption {
        private Integer id;
        private String name;

        public CourtOption(Integer id, String name) {
            this.id = id;
            this.name = name;
        }

        public Integer getId() { return id; }
        public String getName() { return name; }

        @Override
        public String toString() {
            return name;
        }
    }
}
