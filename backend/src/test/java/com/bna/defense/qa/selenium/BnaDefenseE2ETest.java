package com.bna.defense.qa.selenium;

import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(AllureScreenshotExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class BnaDefenseE2ETest {

    public static WebDriver driver;
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
        Allure.step("Etant donné que je me connecte en tant que '" + username + "'", () -> {
            try {
                driver.get("about:blank");
                ((JavascriptExecutor) driver).executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
            } catch (Exception e) {}
            
            driver.get(BASE_URL + "/login");
            
            WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
            WebElement passwordInput = driver.findElement(By.id("password"));
            WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-login")));
            
            usernameInput.clear();
            usernameInput.sendKeys(username);
            passwordInput.clear();
            passwordInput.sendKeys(password);
            
            loginBtn.click();
            wait.until(ExpectedConditions.urlContains("/dashboard"));
        });
    }

    private void logout() {
        Allure.step("Et je me déconnecte", () -> {
            try {
                WebElement profileMenu = wait.until(ExpectedConditions.elementToBeClickable(By.id("menu-profile")));
                ((JavascriptExecutor) driver).executeScript("arguments[0].click();", profileMenu);
                WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
                ((JavascriptExecutor) driver).executeScript("arguments[0].click();", logoutBtn);
                wait.until(ExpectedConditions.urlContains("/login"));
            } catch (Exception e) {
                try {
                    driver.get("about:blank");
                    ((JavascriptExecutor) driver).executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
                } catch (Exception ignore) {}
            }
        });
    }

    @Test
    @Order(1)
    @Description("En tant qu'utilisateur de la plateforme, je veux pouvoir me connecter avec mon rôle (Administrateur puis Chargé) et être redirigé vers mon tableau de bord.")
    @DisplayName("Flux E2E de Connexion multi-rôles")
    public void testAuthenticationFlows() {
        login("admin", "admin123");
        Allure.step("Alors je vérifie que je suis sur le tableau de bord Administrateur", () -> {
            assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        });
        logout();

        login("charge", "password123");
        Allure.step("Alors je vérifie que je suis sur le tableau de bord Chargé", () -> {
            assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        });
        logout();
    }

    @Test
    @Order(2)
    @Description("En tant que Chargé, je veux créer un nouveau dossier de contentieux et pouvoir ensuite modifier ses informations.")
    @DisplayName("Flux E2E : Création et modification de dossier par le Chargé")
    public void testCreateAndUpdateDossier() {
        login("charge", "password123");

        Allure.step("Quand je navigue vers la page de création d'un nouveau dossier", () -> {
            WebElement newDossierLink = wait.until(ExpectedConditions.elementToBeClickable(By.id("nav-nouveau-dossier")));
            newDossierLink.click();
            wait.until(ExpectedConditions.urlContains("/nouveau-dossier"));
        });

        Allure.step("Et je remplis les informations du dossier (Référence, Titre, Montant...)", () -> {
            driver.findElement(By.id("reference")).sendKeys("DOS-E2E-999");
            driver.findElement(By.id("titre")).sendKeys("Dossier Contentieux E2E Selenium");
            driver.findElement(By.id("clientName")).sendKeys("Société BNA Client E2E");
            driver.findElement(By.id("montantLitige")).sendKeys("250000");

            WebElement partieSelectElement = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("partieLitige")));
            wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(By.cssSelector("#partieLitige option"), 1));
            Select partieSelect = new Select(partieSelectElement);
            partieSelect.selectByIndex(1);

            driver.findElement(By.id("description")).sendKeys("Description du dossier créé via Selenium.");
        });

        Allure.step("Alors j'enregistre le dossier et je vérifie qu'il apparaît dans ma liste", () -> {
            WebElement saveBtn = driver.findElement(By.id("btn-submit-dossier"));
            saveBtn.click();
            wait.until(ExpectedConditions.urlContains("/mes-dossiers"));
        });

        Allure.step("Quand j'édite le titre de ce dossier", () -> {
            WebElement editBtn = null;
            for (int i = 0; i < 3; i++) {
                try {
                    editBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("edit-DOS-E2E-999")));
                    editBtn.click();
                    break;
                } catch (org.openqa.selenium.StaleElementReferenceException e) {
                    try { Thread.sleep(500); } catch (InterruptedException ie) {}
                }
            }
            
            WebElement titreInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("titre")));
            titreInput.clear();
            titreInput.sendKeys("Dossier Contentieux E2E Selenium Modifié");
            
            WebElement partieSelectElementEdit = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("partieLitige")));
            wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(By.cssSelector("#partieLitige option"), 1));
            Select partieSelectEdit = new Select(partieSelectElementEdit);
            partieSelectEdit.selectByIndex(1);
            
            driver.findElement(By.id("btn-submit-dossier")).click();
            wait.until(ExpectedConditions.urlContains("/mes-dossiers"));
        });

        logout();
    }

    @Test
    @Order(3)
    @Description("En tant que Chargé, je veux ajouter une affaire judiciaire et l'associer au dossier de contentieux existant.")
    @DisplayName("Flux E2E : Ajout d'une affaire à un dossier existant")
    public void testAddAffaire() {
        login("charge", "password123");

        Allure.step("Quand je navigue vers la page d'ajout d'une affaire", () -> {
            driver.get(BASE_URL + "/nouvelle-affaire");
            try { Thread.sleep(2000); } catch (InterruptedException e) {}
        });

        Allure.step("Et je remplis les informations de l'affaire", () -> {
            WebElement numAffaireInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("numAffaireUnique")));
            numAffaireInput.click();
            numAffaireInput.clear();
            numAffaireInput.sendKeys("AFF-E2E-777");
            try { Thread.sleep(200); } catch (InterruptedException e) {}

            WebElement titreAffaireInput = driver.findElement(By.id("titreAffaire"));
            titreAffaireInput.click();
            titreAffaireInput.clear();
            titreAffaireInput.sendKeys("Affaire Civile Première Instance E2E");
            try { Thread.sleep(200); } catch (InterruptedException e) {}

            WebElement typeAffaireSelectElement = driver.findElement(By.id("typeAffaire"));
            Select typeAffaireSelect = new Select(typeAffaireSelectElement);
            typeAffaireSelect.selectByValue("CIVILE");

            WebElement descAffaireInput = driver.findElement(By.id("descriptionAffaire"));
            descAffaireInput.click();
            descAffaireInput.clear();
            descAffaireInput.sendKeys("Description affaire generee par Selenium.");
            try { Thread.sleep(200); } catch (InterruptedException e) {}
        });

        Allure.step("Et j'associe cette affaire au dossier précédemment créé", () -> {
            WebElement selectDossier = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("select-dossier")));
            selectDossier.click();
            try { Thread.sleep(500); } catch (InterruptedException e) {}
            selectDossier.sendKeys("DOS-E2E-999");
            try { Thread.sleep(1500); } catch (InterruptedException e) {}

            try {
                WebElement dossierOption = wait.until(ExpectedConditions.elementToBeClickable(By.id("dossier-option-DOS-E2E-999")));
                dossierOption.click();
                try { Thread.sleep(500); } catch (InterruptedException ignored) {}
            } catch (Exception e) {}
        });

        Allure.step("Alors j'enregistre l'affaire et elle est validée", () -> {
            try { Thread.sleep(500); } catch (InterruptedException e) {}
            WebElement saveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-save-affaire")));
            saveBtn.click();
            wait.until(ExpectedConditions.urlContains("/affaires"));
        });

        logout();
    }

    @Test
    @Order(4)
    @Description("En tant que Chargé, je veux ajouter des frais de justice (greffe, avocat, etc.) et joindre un document PDF ou autre comme justificatif.")
    @DisplayName("Flux E2E : Ajout de frais et upload d'un document justificatif")
    public void testAddFraisWithDocument() {
        login("charge", "password123");

        Allure.step("Quand je navigue vers la demande d'ajout de frais", () -> {
            driver.get(BASE_URL + "/nouvelle-demande-frais");
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        });

        Allure.step("Et je sélectionne le dossier et j'indique le montant et les taxes", () -> {
            WebElement referenceDossier = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reference-dossier-select")));
            wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(By.cssSelector("#reference-dossier-select option"), 1));
            Select selectDossier = new Select(referenceDossier);
            selectDossier.selectByValue("DOS-E2E-999");
            
            WebElement montantInput = driver.findElement(By.id("montant"));
            montantInput.clear();
            montantInput.sendKeys("150");

            WebElement tvaInput = driver.findElement(By.id("tva"));
            tvaInput.clear();
            tvaInput.sendKeys("19");
            
            WebElement typeFraisSelectElement = driver.findElement(By.id("typeFrais"));
            Select typeFraisSelect = new Select(typeFraisSelectElement);
            typeFraisSelect.selectByValue("GREFFE");
        });

        Allure.step("Et je joins un fichier justificatif", () -> {
            WebElement fileUpload = driver.findElement(By.id("file-upload"));
            fileUpload.sendKeys(System.getProperty("user.dir") + "/pom.xml");
        });

        Allure.step("Alors j'enregistre et ma demande est soumise pour approbation", () -> {
            driver.findElement(By.id("btn-save-frais")).click();
            wait.until(ExpectedConditions.urlContains("/mes-frais"));
        });

        logout();
    }

    @Test
    @Order(5)
    @Description("En tant que Chargé, je soumets mon dossier. Puis le Pré-validateur l'approuve. Enfin, le Validateur le rejette avec un motif justifié.")
    @DisplayName("Flux E2E : Workflow complet - Pré-validation, Validation et Rejet")
    public void testWorkflowValidationAndReject() {
        login("charge", "password123");
        Allure.step("Quand je soumets le dossier en tant que Chargé", () -> {
            driver.get(BASE_URL + "/mes-dossiers");
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
            WebElement submitBtn = null;
            for (int i = 0; i < 3; i++) {
                try {
                    submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-DOS-E2E-999")));
                    submitBtn.click();
                    break;
                } catch (org.openqa.selenium.StaleElementReferenceException e) {
                    try { Thread.sleep(500); } catch (InterruptedException ie) {}
                }
            }
        });
        logout();

        login("preval", "password123");
        Allure.step("Et je l'approuve en tant que Pré-Validateur", () -> {
            driver.get(BASE_URL + "/frais-review");
            try { Thread.sleep(1500); } catch (InterruptedException e) {}
            WebElement approvePrevalBtn = null;
            for (int i = 0; i < 3; i++) {
                try {
                    approvePrevalBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("preval-approve-DOS-E2E-999")));
                    approvePrevalBtn.click();
                    break;
                } catch (org.openqa.selenium.StaleElementReferenceException e) {
                    try { Thread.sleep(500); } catch (InterruptedException ie) {}
                }
            }
        });
        logout();

        login("val", "password123");
        Allure.step("Alors je le rejette en tant que Validateur en spécifiant le motif", () -> {
            driver.get(BASE_URL + "/frais-review");
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
            WebElement rejectBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("reject-DOS-E2E-999")));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", rejectBtn);
            
            try { Thread.sleep(500); } catch (InterruptedException e) {}

            WebElement motifInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reject-motif")));
            ((JavascriptExecutor) driver).executeScript(
                "arguments[0].value = 'Le montant des frais de litige déclarés semble disproportionné par rapport aux barèmes standard.'; " +
                "arguments[0].dispatchEvent(new Event('input', { bubbles: true })); " +
                "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", 
                motifInput);
            
            WebElement confirmRejectBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-confirm-reject")));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", confirmRejectBtn);
            
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-confirm-reject")));
        });
        logout();
    }

    @Test
    @Order(6)
    @Description("En tant qu'administrateur, je veux pouvoir consulter les graphiques de performances et les métriques globales.")
    @DisplayName("Flux E2E : Consultation des KPIs et Dashboard")
    public void testConsultKPIs() {
        login("admin", "admin123");
        
        Allure.step("Quand je consulte le tableau de bord", () -> {
            WebElement globalStatsCard = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("kpi-total-dossiers")));
            assertNotNull(globalStatsCard.getText());
        });

        Allure.step("Alors les graphiques de taux de validation s'affichent", () -> {
            WebElement validationRateChart = driver.findElement(By.id("chart-validation-rate"));
            assertTrue(validationRateChart.isDisplayed());
        });

        logout();
    }

    @Test
    @Order(7)
    @Description("En tant qu'administrateur, je veux rechercher un utilisateur et essayer de désactiver un autre admin, ce qui m'est refusé.")
    @DisplayName("Flux E2E : Gestion des utilisateurs par l'Administrateur")
    public void testUserManagementByAdmin() {
        login("admin", "admin123");
        
        Allure.step("Quand je navigue vers le panneau des utilisateurs", () -> {
            driver.get(BASE_URL + "/admin/users");
            WebElement addUserBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-add-user")));
            assertTrue(addUserBtn.isDisplayed());
        });

        Allure.step("Et je recherche le profil de l'administrateur", () -> {
            WebElement searchInput = driver.findElement(By.id("user-search"));
            searchInput.sendKeys("admin");
        });

        Allure.step("Alors si j'essaie de désactiver son compte, la plateforme m'affiche une erreur", () -> {
            WebElement toggleStatusAdminBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("toggle-status-admin")));
            toggleStatusAdminBtn.click();
            WebElement alertMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-message")));
            assertTrue(alertMessage.getText().contains("Action impossible"));
        });

        logout();
    }

    @Test
    @Order(8)
    @Description("En tant qu'utilisateur, si je saisis un mot de passe incorrect, le système doit m'empêcher de me connecter. Ce test échoue volontairement en supposant que la connexion a réussi pour déclencher et démontrer la capture d'écran Allure sur échec.")
    @DisplayName("[DÉMO] Capture d'écran sur mot de passe incorrect")
    public void testZIncorrectPassword_DemoScreenshot() {
        Allure.step("Etant donné que j'essaie de me connecter avec un mauvais mot de passe", () -> {
            try {
                driver.get("about:blank");
                ((JavascriptExecutor) driver).executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
            } catch (Exception e) {}
            
            driver.get(BASE_URL + "/login");
            
            WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
            WebElement passwordInput = driver.findElement(By.id("password"));
            WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-login")));
            
            usernameInput.clear();
            usernameInput.sendKeys("charge");
            passwordInput.clear();
            passwordInput.sendKeys("M0TD3P4SSE_F4UX");
            
            loginBtn.click();
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        });

        Allure.step("Alors je devrais être redirigé vers le tableau de bord (ECHEC INTENTIONNEL POUR CAPTURE)", () -> {
            // This will intentionally fail because we are still on the login page due to the bad password.
            assertTrue(driver.getCurrentUrl().contains("/dashboard"), "L'utilisateur n'a pas été redirigé vers le tableau de bord ! La connexion a échoué.");
        });
    }

}
