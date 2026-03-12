package com.securevote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.boot.CommandLineRunner;
import com.securevote.repositories.VoterRepository;
import com.securevote.repositories.AdminRepository;
import com.securevote.models.Admin;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

//This will make all endpoints public and avoids any authentication/CORS/security filters getting in the way while you test frontend modules.
//When you want security back, remove exclude = { ... } and follow the SecurityConfig approach in section
@SpringBootApplication
@EntityScan("com.securevote.models")
@EnableJpaRepositories("com.securevote.repositories")
public class SecureVoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureVoteApplication.class, args);
    }

    // @Bean
    // public WebMvcConfigurer corsConfigurer() {
    // return new WebMvcConfigurer() {
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    // registry.addMapping("/api/**")
    // .allowedOrigins("http://localhost:3000")
    // .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    // .allowedHeaders("*")
    // .allowCredentials(true);
    // }
    // };
    // }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CommandLineRunner verifiedVotersInit(VoterRepository voterRepository, AdminRepository adminRepository) {
        return args -> {
            System.out.println("Initializing data verification...");

            // Verify all voters
            voterRepository.findAll().forEach(voter -> {
                if (!voter.getIsVerified()) {
                    voter.setIsVerified(true);
                    voterRepository.save(voter);
                    System.out.println("Auto-verified voter: " + voter.getEpicNumber());
                }
            });

            // Ensure election_admin exists with correct password
            Admin admin = adminRepository.findByUsername("election_admin").orElseGet(() -> {
                Admin newAdmin = new Admin();
                newAdmin.setUsername("election_admin");
                return newAdmin;
            });
            admin.setPasswordHash(new BCryptPasswordEncoder().encode("admin123"));
            admin.setRole("election_commissioner");
            adminRepository.save(admin);
            System.out.println("Admin reset: election_admin / admin123");
        };
    }

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}