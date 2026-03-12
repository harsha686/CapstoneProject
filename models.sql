-- SecureVote Database Schema
-- Indian Smart Voting System

-- Create database if not exists and use it (safe for re-import)
CREATE DATABASE IF NOT EXISTS securevote DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE securevote;

-- Disable FK checks while dropping/creating tables to avoid ordering issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in order (children first) to make import re-runnable
DROP TABLE IF EXISTS vote_audit_log;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS voters;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS election_sessions;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS constituencies;

-- Keep foreign key checks disabled until tables are created; they will be re-enabled at the end of the file

-- Constituencies Table
-- SecureVote Database Schema (MySQL Version)

CREATE TABLE constituencies(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parties Table
CREATE TABLE parties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    symbol_path VARCHAR(255),
    leader VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Candidates Table
CREATE TABLE candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    party_id BIGINT NOT NULL,
    constituency_id BIGINT NOT NULL,
    manifesto TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidates_party FOREIGN KEY (party_id) REFERENCES parties(id),
    CONSTRAINT fk_candidates_constituency FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Voters Table
CREATE TABLE voters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    address TEXT NOT NULL,
    epic_number VARCHAR(20) NOT NULL UNIQUE,
    aadhaar_number VARCHAR(20) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    constituency_id BIGINT NOT NULL,
    face_encoding LONGBLOB,
    has_voted BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_voters_constituency FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Votes Table
CREATE TABLE votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voter_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    constituency_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    CONSTRAINT fk_votes_voter FOREIGN KEY (voter_id) REFERENCES voters(id),
    CONSTRAINT fk_votes_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    CONSTRAINT fk_votes_constituency FOREIGN KEY (constituency_id) REFERENCES constituencies(id),
    UNIQUE KEY unique_vote_voter (voter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Admins Table
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'election_commissioner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Election Sessions Table
CREATE TABLE election_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    constituency_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_election_sessions_constituency FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vote Audit Log Table
CREATE TABLE vote_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voter_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_vote_audit_voter FOREIGN KEY (voter_id) REFERENCES voters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_voters_epic ON voters(epic_number);
CREATE INDEX idx_voters_aadhaar ON voters(aadhaar_number);
CREATE INDEX idx_voters_constituency ON voters(constituency_id);
CREATE INDEX idx_candidates_constituency ON candidates(constituency_id);
CREATE INDEX idx_votes_constituency ON votes(constituency_id);
CREATE INDEX idx_votes_candidate ON votes(candidate_id);

-- Sample Data
INSERT INTO constituencies (name, state, pincode) VALUES 
('Mumbai South', 'Maharashtra', '400001'),
('New Delhi', 'Delhi', '110001'),
('Bangalore Central', 'Karnataka', '560001'),
('Chennai Central', 'Tamil Nadu', '600001'),
('Kolkata North', 'West Bengal', '700001');

-- Sample Parties
INSERT INTO parties (name, symbol_path, leader) VALUES 
('Bharatiya Janata Party', '/images/bjp_lotus.png', 'Narendra Modi'),
('Indian National Congress', '/images/congress_hand.png', 'Mallikarjun Kharge'),
('Aam Aadmi Party', '/images/aap_broom.png', 'Arvind Kejriwal'),
('Dravida Munnetra Kazhagam', '/images/dmk_rising_sun.png', 'M.K. Stalin'),
('Trinamool Congress', '/images/tmc_flower.png', 'Mamata Banerjee');

INSERT INTO admins (username, password_hash) VALUES 
('election_admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5E8QvP3NORdKL3vH6Fmq4J2');

-- Re-enable foreign key checks after all tables have been created
SET FOREIGN_KEY_CHECKS = 1;
