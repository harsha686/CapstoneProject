package com.securevote.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "voters")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Voter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @Min(value = 18, message = "Age must be 18 or above")
    @Max(value = 120, message = "Age must be realistic")
    @Column(nullable = false)
    private Integer age;

    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    @Pattern(regexp = "^[A-Z]{3}[0-9]{7}$", message = "Invalid EPIC number format")
    @Column(nullable = false, unique = true)
    private String epicNumber;

    @Pattern(regexp = "^[0-9]{12}$", message = "Invalid Aadhaar number")
    @Column(nullable = false, unique = true)
    private String aadhaarNumber;

    @Pattern(regexp = "^[0-9]{10}$", message = "Invalid phone number")
    @Column(nullable = false)
    private String phoneNumber;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Transient
    @JsonProperty("password")
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "constituency_id", nullable = false)
    private Constituency constituency;

    @Lob
    @Column(columnDefinition = "BLOB")
    @JsonIgnore
    private byte[] faceEncoding;

    @Column(nullable = false)
    private Boolean hasVoted = false;

    @Column(nullable = false)
    private Boolean isVerified = false;

    // Constructors
    public Voter() {
    }

    public Voter(String name, Integer age, String address, String epicNumber, 
                String aadhaarNumber, String phoneNumber, String passwordHash) {
        this.name = name;
        this.age = age;
        this.address = address;
        this.epicNumber = epicNumber;
        this.aadhaarNumber = aadhaarNumber;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEpicNumber() {
        return epicNumber;
    }

    public void setEpicNumber(String epicNumber) {
        this.epicNumber = epicNumber;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    @JsonProperty("passwordHash")
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @JsonProperty("password")
    public void setPassword(String password) {
        this.password = password;
    }

    public Constituency getConstituency() {
        return constituency;
    }

    public void setConstituency(Constituency constituency) {
        this.constituency = constituency;
    }

    public byte[] getFaceEncoding() {
        return faceEncoding;
    }

    public void setFaceEncoding(byte[] faceEncoding) {
        this.faceEncoding = faceEncoding;
    }

    public Boolean getHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(Boolean hasVoted) {
        this.hasVoted = hasVoted;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
}