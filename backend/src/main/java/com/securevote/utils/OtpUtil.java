package com.securevote.utils;

import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class OtpUtil {
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;
    
    private final ConcurrentMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Random random = new Random();
    
    public OtpUtil() {
        // Schedule cleanup task to remove expired OTPs
        scheduler.scheduleAtFixedRate(this::cleanupExpiredOtps, 0, 1, TimeUnit.MINUTES);
    }
    
    public String generateOtp(String identifier) {
        String otp = String.format("%06d", random.nextInt(1000000));
        long expiryTime = System.currentTimeMillis() + (OTP_VALIDITY_MINUTES * 60 * 1000);
        
        otpStorage.put(identifier, new OtpData(otp, expiryTime));
        
        // Log OTP for development (in production, this would be sent via SMS)
        System.out.println("Generated OTP for " + identifier + ": " + otp);
        
        return otp;
    }
    
    public boolean validateOtp(String identifier, String otp) {
        OtpData otpData = otpStorage.get(identifier);
        if (otpData == null) {
            return false;
        }
        
        if (System.currentTimeMillis() > otpData.expiryTime) {
            otpStorage.remove(identifier);
            return false;
        }
        
        boolean isValid = otpData.otp.equals(otp);
        if (isValid) {
            otpStorage.remove(identifier);
        }
        
        return isValid;
    }
    
    public void removeOtp(String identifier) {
        otpStorage.remove(identifier);
    }
    
    private void cleanupExpiredOtps() {
        long currentTime = System.currentTimeMillis();
        otpStorage.entrySet().removeIf(entry -> currentTime > entry.getValue().expiryTime);
    }
    
    private static class OtpData {
        final String otp;
        final long expiryTime;
        
        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}