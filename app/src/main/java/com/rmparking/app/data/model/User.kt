package com.rmparking.app.data.model

data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val contactPhone: String?,
    val role: String,
    val permissions: List<String>?,
    val isActive: Boolean,
    val documentType: String?,
    val documentNumber: String?,
    val createdAt: String,
    val updatedAt: String
)