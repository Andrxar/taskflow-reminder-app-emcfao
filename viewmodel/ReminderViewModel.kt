
package com.reminderapp.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.reminderapp.data.Reminder
import com.reminderapp.repository.ReminderRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ReminderViewModel(application: Application) : AndroidViewModel(application) {
    
    private val repository = ReminderRepository(application)
    
    val activeReminders = repository.getActiveReminders()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    
    val completedReminders = repository.getCompletedReminders()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    fun addReminder(title: String, description: String, dateTime: Long) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                repository.addReminder(title, description, dateTime)
                println("Reminder added successfully from ViewModel")
            } catch (e: Exception) {
                _errorMessage.value = "Ошибка при добавлении напоминания: ${e.message}"
                println("Error in ViewModel addReminder: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun updateReminder(reminder: Reminder) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                repository.updateReminder(reminder)
                println("Reminder updated successfully from ViewModel")
            } catch (e: Exception) {
                _errorMessage.value = "Ошибка при обновлении напоминания: ${e.message}"
                println("Error in ViewModel updateReminder: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun deleteReminder(id: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                repository.deleteReminder(id)
                println("Reminder deleted successfully from ViewModel")
            } catch (e: Exception) {
                _errorMessage.value = "Ошибка при удалении напоминания: ${e.message}"
                println("Error in ViewModel deleteReminder: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun completeReminder(id: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                repository.completeReminder(id)
                println("Reminder completed successfully from ViewModel")
            } catch (e: Exception) {
                _errorMessage.value = "Ошибка при завершении напоминания: ${e.message}"
                println("Error in ViewModel completeReminder: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun postponeReminder(id: String, minutes: Int) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                repository.postponeReminder(id, minutes)
                println("Reminder postponed successfully from ViewModel")
            } catch (e: Exception) {
                _errorMessage.value = "Ошибка при переносе напоминания: ${e.message}"
                println("Error in ViewModel postponeReminder: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
}
