package com.securevote.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Base64;

@Component
public class FaceEncodingUtil {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public double[] decodeFaceEncoding(byte[] encodedData) {
        if (encodedData == null || encodedData.length == 0) {
            return null;
        }
        
        try {
            String jsonString = new String(encodedData);
            return objectMapper.readValue(jsonString, double[].class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to decode face encoding", e);
        }
    }
    
    public byte[] encodeFaceEncoding(double[] faceEncoding) {
        if (faceEncoding == null || faceEncoding.length == 0) {
            return null;
        }
        
        try {
            String jsonString = objectMapper.writeValueAsString(faceEncoding);
            return jsonString.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to encode face encoding", e);
        }
    }
    
    public boolean compareFaceEncodings(double[] encoding1, double[] encoding2, double tolerance) {
        if (encoding1 == null || encoding2 == null || encoding1.length != encoding2.length) {
            return false;
        }
        
        double distance = calculateEuclideanDistance(encoding1, encoding2);
        return distance < tolerance;
    }
    
    private double calculateEuclideanDistance(double[] a, double[] b) {
        double sum = 0.0;
        for (int i = 0; i < a.length; i++) {
            double diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}