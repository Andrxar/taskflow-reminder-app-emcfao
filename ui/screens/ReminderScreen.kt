
package com.reminderapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reminderapp.data.Reminder
import com.reminderapp.ui.components.ReminderCard
import com.reminderapp.ui.components.ReminderDialog
import com.reminderapp.viewmodel.ReminderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReminderScreen(viewModel: ReminderViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    var showDialog by remember { mutableStateOf(false) }
    var editingReminder by remember { mutableStateOf<Reminder?>(null) }
    
    val activeReminders by viewModel.activeReminders.collectAsState()
    val completedReminders by viewModel.completedReminders.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    
    // Show error message
    errorMessage?.let { message ->
        LaunchedEffect(message) {
            // You could show a snackbar here
            println("Error: $message")
            viewModel.clearError()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "Напоминания",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Tab Row
        TabRow(
            selectedTabIndex = selectedTab,
            modifier = Modifier.fillMaxWidth()
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Активные (${activeReminders.size})") }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Выполненные (${completedReminders.size})") }
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Content
        Box(modifier = Modifier.weight(1f)) {
            val currentReminders = if (selectedTab == 0) activeReminders else completedReminders
            
            if (currentReminders.isEmpty()) {
                // Empty state
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = if (selectedTab == 0) "Нет активных напоминаний" else "Нет выполненных напоминаний",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (selectedTab == 0) 
                            "Создайте новое напоминание, нажав кнопку +" 
                        else 
                            "Выполненные напоминания будут отображаться здесь",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                // Reminders list
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(currentReminders) { reminder ->
                        ReminderCard(
                            reminder = reminder,
                            onEdit = if (selectedTab == 0) { 
                                { editingReminder = it; showDialog = true }
                            } else null,
                            onDelete = { viewModel.deleteReminder(it.id) },
                            onComplete = { viewModel.completeReminder(it.id) }
                        )
                    }
                }
            }
            
            // Loading indicator
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
        }
        
        // Add button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.Center
        ) {
            ExtendedFloatingActionButton(
                onClick = { 
                    editingReminder = null
                    showDialog = true 
                },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("Добавить напоминание +") }
            )
        }
    }
    
    // Dialog
    if (showDialog) {
        ReminderDialog(
            reminder = editingReminder,
            onDismiss = { 
                showDialog = false
                editingReminder = null
            },
            onSave = { title, description, dateTime ->
                if (editingReminder != null) {
                    viewModel.updateReminder(
                        editingReminder!!.copy(
                            title = title,
                            description = description,
                            dateTime = dateTime,
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                } else {
                    viewModel.addReminder(title, description, dateTime)
                }
                showDialog = false
                editingReminder = null
            }
        )
    }
}
