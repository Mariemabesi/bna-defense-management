package com.bna.defense.qa.selenium;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class BnaDefenseE2ETest {

    private static WebDriver driver;
    private static WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:4200";

    @BeforeAll
    public static void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterAll
    public static void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private void login(String username, String password) {
        driver.get(BASE_URL + "/login");
        
        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
        WebElement passwordInput = driver.findElement(By.id("password"));
        WebElement loginBtn = driver.findElement(By.id("btn-login"));

        usernameInput.clear();
        usernameInput.sendKeys(username);
        passwordInput.clear();
        passwordInput.sendKeys(password);
        
        loginBtn.click();
        wait.until(ExpectedConditions.urlContains("/dashboard"));
    }

    private void logout() {
        WebElement profileMenu = wait.until(ExpectedConditions.elementToBeClickable(By.id("menu-profile")));
        profileMenu.click();
        WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
        logoutBtn.click();
        wait.until(ExpectedConditions.urlContains("/login"));
    }

    @Test
    @Order(1)
    @DisplayName("Flux E2E de Connexion multi-rôles")
    public void testAuthenticationFlows() {
        login("admin", "admin123");
        assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        logout();

        login("charge", "password123");
        assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        logout();
    }

    @Test
    @Order(2)
    @DisplayName("Flux E2E : Création et modification de dossier par le Chargé")
    public void testCreateAndUpdateDossier() {
        login("charge", "password123");

        WebElement newDossierLink = wait.until(ExpectedConditions.elementToBeClickable(By.id("nav-nouveau-dossier")));
        newDossierLink.click();
        wait.until(ExpectedConditions.urlContains("/nouveau-dossier"));

        driver.findElement(By.id("reference")).sendKeys("DOS-E2E-999");
        driver.findElement(By.id("titre")).sendKeys("Dossier Contentieux E2E Selenium");
        driver.findElement(By.id("clientName")).sendKeys("Société BNA Client E2E");
        driver.findElement(By.id("montantLitige")).sendKeys("250000");
        driver.findElement(By.id("description")).sendKeys("Description du dossier créé via Selenium.");
        
        WebElement saveBtn = driver.findElement(By.id("btn-submit-dossier"));
        saveBtn.click();

        wait.until(ExpectedConditions.urlContains("/mes-dossiers"));
        
        WebElement editBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("edit-DOS-E2E-999")));
        editBtn.click();
        
        WebElement titreInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("titre")));
        titreInput.clear();
        titreInput.sendKeys("Dossier Contentieux E2E Selenium Modifié");
        
        driver.findElement(By.id("btn-submit-dossier")).click();
        wait.until(ExpectedConditions.urlContains("/mes-dossiers"));

        logout();
    }

    @Test
    @Order(3)
    @DisplayName("Flux E2E : Ajout d'une affaire à un dossier existant")
    public void testAddAffaire() {
        login("charge", "password123");

        driver.get(BASE_URL + "/nouvelle-affaire");
        WebElement selectDossier = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("select-dossier")));
        selectDossier.sendKeys("Dossier Contentieux E2E Selenium Modifié");

        driver.findElement(By.id("numAffaireUnique")).sendKeys("AFF-E2E-777");
        driver.findElement(By.id("titreAffaire")).sendKeys("Affaire Civile Première Instance E2E");
        driver.findElement(By.id("typeAffaire")).sendKeys("CIVILE");
        driver.findElement(By.id("descriptionAffaire")).sendKeys("Description affaire générée par Selenium.");

        driver.findElement(By.id("btn-save-affaire")).click();
        wait.until(ExpectedConditions.urlContains("/affaires"));

        logout();
    }

    @Test
    @Order(4)
    @DisplayName("Flux E2E : Ajout de frais et upload d'un document justificatif")
    public void testAddFraisWithDocument() {
        login("charge", "password123");

        driver.get(BASE_URL + "/nouvelle-demande-frais");
        
        WebElement referenceDossier = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reference-dossier-select")));
        referenceDossier.sendKeys("DOS-E2E-999");
        
        driver.findElement(By.id("montant")).sendKeys("150");
        driver.findElement(By.id("tva")).sendKeys("19");
        driver.findElement(By.id("typeFrais")).sendKeys("GREFFE");

        WebElement fileUpload = driver.findElement(By.id("file-upload"));
        fileUpload.sendKeys(System.getProperty("user.dir") + "/pom.xml");
        
        driver.findElement(By.id("btn-save-frais")).click();
        wait.until(ExpectedConditions.urlContains("/mes-frais"));

        logout();
    }

    @Test
    @Order(5)
    @DisplayName("Flux E2E : Workflow complet - Pré-validation, Validation et Rejet")
    public void testWorkflowValidationAndReject() {
        login("charge", "password123");
        driver.get(BASE_URL + "/mes-dossiers");
        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-DOS-E2E-999")));
        submitBtn.click();
        logout();

        login("preval", "password123");
        driver.get(BASE_URL + "/frais-review");
        WebElement approvePrevalBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("preval-approve-DOS-E2E-999")));
        approvePrevalBtn.click();
        logout();

        login("val", "password123");
        driver.get(BASE_URL + "/frais-review");
        WebElement rejectBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("reject-DOS-E2E-999")));
        rejectBtn.click();

        WebElement motifInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reject-motif")));
        motifInput.sendKeys("Le montant des frais de litige déclarés semble disproportionné par rapport aux barèmes standard.");
        
        driver.findElement(By.id("btn-confirm-reject")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-confirm-reject")));
        logout();
    }

    @Test
    @Order(6)
    @DisplayName("Flux E2E : Consultation des KPIs et Dashboard")
    public void testConsultKPIs() {
        login("admin", "admin123");
        
        WebElement globalStatsCard = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("kpi-total-dossiers")));
        assertNotNull(globalStatsCard.getText());

        WebElement validationRateChart = driver.findElement(By.id("chart-validation-rate"));
        assertTrue(validationRateChart.isDisplayed());

        logout();
    }

    @Test
    @Order(7)
    @DisplayName("Flux E2E : Gestion des utilisateurs par l'Administrateur")
    public void testUserManagementByAdmin() {
        login("admin", "admin123");
        driver.get(BASE_URL + "/admin/users");

        WebElement addUserBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-add-user")));
        assertTrue(addUserBtn.isDisplayed());

        WebElement searchInput = driver.findElement(By.id("user-search"));
        searchInput.sendKeys("admin");

        WebElement toggleStatusAdminBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("toggle-status-admin")));
        toggleStatusAdminBtn.click();
        WebElement alertMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-message")));
        assertTrue(alertMessage.getText().contains("Action impossible"));

        logout();
    }
}
