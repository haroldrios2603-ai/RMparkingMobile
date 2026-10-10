package com.rmparking.app.data.model

data class LoginResponse(
    val accessToken: String,
    val attendanceId: String?,
    val checkIn: String?,
    val attendanceAction: String?
)