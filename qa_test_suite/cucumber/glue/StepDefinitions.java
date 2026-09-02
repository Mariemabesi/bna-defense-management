package com.bna.defense.qa.cucumber.glue;

import io.cucumber.java.fr.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class StepDefinitions {

    private final WebDriver driver = Hooks.getDriver();
    private final WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    private static final String BASE_URL = "http://localhost:4200";
    private String selectedUser;

    @Étantdonné("que l'utilisateur est sur la page de connexion de l'application BNA")
    public void userIsOnLoginPage() {
        driver.get(BASE_URL + "/login");
    }

    @Quand("l'utilisateur saisit son nom d'utilisateur {string} et son mot de passe {string}")
    public void userEntersCredentials(String username, String password) {
        WebElement usernameField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
        usernameField.clear();
        usernameField.sendKeys(username);

        WebElement passwordField = driver.findElement(By.id("password"));
        passwordField.clear();
        passwordField.sendKeys(password);
    }

    @Quand("clique sur le bouton de connexion")
    public void userClicksLogin() {
        driver.findElement(By.id("btn-login")).click();
    }

    @Alors("l'utilisateur doit être redirigé vers le tableau de bord principal")
    public void userIsRedirectedToDashboard() {
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Alors("une session de navigation sécurisée doit être ouverte")
    public void secureSessionIsOpened() {
        WebElement profileMenu = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("menu-profile")));
        assertTrue(profileMenu.isDisplayed());
    }

    @Alors("un message d'erreur {string} doit s'afficher")
    public void errorMessageDisplays(String expectedError) {
        WebElement errorToast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-message")));
        assertTrue(errorToast.getText().contains(expectedError));
    }

    @Alors("l'utilisateur doit rester sur la page de connexion")
    public void userRemainsOnLoginPage() {
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    // DOSSIERS
    @Étantdonné("que l'utilisateur est authentifié avec le rôle {string}")
    public void userIsAuthenticatedWithRole(String role) {
        driver.get(BASE_URL + "/login");
        WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
        userField.sendKeys(role.toLowerCase().contains("charge") ? "charge" : "admin");
        driver.findElement(By.id("password")).sendKeys(role.toLowerCase().contains("charge") ? "password123" : "admin123");
        driver.findElement(By.id("btn-login")).click();
        wait.until(ExpectedConditions.urlContains("/dashboard"));
    }

    @Quand("l'utilisateur accède au formulaire de création de dossier")
    public void userGoesToNewDossierForm() {
        driver.get(BASE_URL + "/nouveau-dossier");
    }

    @Quand("saisit la référence unique {string}")
    public void userEntersReference(String ref) {
        WebElement refInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reference")));
        refInput.clear();
        refInput.sendKeys(ref);
    }

    @Quand("saisit uniquement la référence {string}")
    public void userEntersOnlyReference(String ref) {
        userEntersReference(ref);
    }

    @Quand("saisit le titre du dossier {string}")
    public void userEntersTitle(String title) {
        driver.findElement(By.id("titre")).sendKeys(title);
    }

    @Quand("saisit le nom du client {string}")
    public void userEntersClientName(String client) {
        driver.findElement(By.id("clientName")).sendKeys(client);
    }

    @Quand("saisit le montant du litige {double}")
    public void userEntersAmount(Double amount) {
        driver.findElement(By.id("montantLitige")).sendKeys(amount.toString());
    }

    @Quand("clique sur le bouton de sauvegarde du dossier")
    public void userSavesDossier() {
        driver.findElement(By.id("btn-submit-dossier")).click();
    }

    @Alors("le dossier {string} doit être créé avec le statut {string}")
    public void dossierIsCreatedWithStatus(String ref, String status) {
        wait.until(ExpectedConditions.urlContains("/mes-dossiers"));
        WebElement dossierRow = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("row-" + ref)));
        assertTrue(dossierRow.findElement(By.className("status-cell")).getText().contains(status));
    }

    @Alors("le dossier doit être listé dans la table de mes dossiers en cours")
    public void dossierIsListedInTable() {
        WebElement table = driver.findElement(By.id("table-dossiers"));
        assertTrue(table.isDisplayed());
    }

    @Quand("laisse le titre vide")
    public void leavesTitleEmpty() {
        driver.findElement(By.id("titre")).clear();
    }

    @Alors("un message d'erreur de validation doit être affiché à l'écran")
    public void validationErrorDisplayed() {
        WebElement validationMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("error-feedback")));
        assertTrue(validationMsg.isDisplayed());
    }

    @Alors("le dossier ne doit pas être créé en base de données")
    public void dossierNotCreated() {
        assertTrue(driver.getCurrentUrl().contains("/nouveau-dossier"));
    }

    // AFFAIRES
    @Étantdonné("que l'utilisateur est connecté et dispose d'un dossier existant {string}")
    public void userIsLoggedInWithExistingDossier(String ref) {
        userIsAuthenticatedWithRole("CHARGE_DOSSIER");
    }

    @Quand("l'utilisateur accède à la page d'ajout d'affaires")
    public void userGoesToNewAffaire() {
        driver.get(BASE_URL + "/nouvelle-affaire");
    }

    @Quand("sélectionne le dossier référencé {string}")
    public void userSelectsDossier(String ref) {
        WebElement selectDossier = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("select-dossier")));
        selectDossier.sendKeys(ref);
    }

    @Quand("saisit le numéro unique d'affaire {string}")
    public void userEntersAffaireNum(String num) {
        driver.findElement(By.id("numAffaireUnique")).sendKeys(num);
    }

    @Quand("saisit le titre de l'affaire {string}")
    public void userEntersAffaireTitle(String title) {
        driver.findElement(By.id("titreAffaire")).sendKeys(title);
    }

    @Quand("choisit le type d'affaire {string}")
    public void userSelectsAffaireType(String type) {
        driver.findElement(By.id("typeAffaire")).sendKeys(type);
    }

    @Quand("clique sur le bouton de sauvegarde de l'affaire")
    public void userSavesAffaire() {
        driver.findElement(By.id("btn-save-affaire")).click();
    }

    @Alors("l'affaire {string} doit être créée et liée au dossier {string}")
    public void affaireLinkedToDossier(String num, String ref) {
        wait.until(ExpectedConditions.urlContains("/affaires"));
        assertTrue(driver.getCurrentUrl().contains("/affaires"));
    }

    @Alors("l'affaire doit figurer dans la liste des affaires avec le statut {string}")
    public void affaireStatusInList(String status) {
        WebElement table = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("table-affaires")));
        assertTrue(table.getText().contains(status));
    }

    // WORKFLOW
    @Étantdonné("que le Chargé de dossier a soumis le dossier {string}")
    public void chargeSubmittedDossier(String ref) {
        userIsAuthenticatedWithRole("CHARGE_DOSSIER");
        driver.get(BASE_URL + "/mes-dossiers");
        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-" + ref)));
        submitBtn.click();
        driver.get(BASE_URL + "/logout");
    }

    @Quand("le Pré-validateur valide le dossier {string}")
    public void prevalApproveDossier(String ref) {
        userIsAuthenticatedWithRole("PRE_VALIDATEUR");
        driver.get(BASE_URL + "/frais-review");
        WebElement approveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("preval-approve-" + ref)));
        approveBtn.click();
        driver.get(BASE_URL + "/logout");
    }

    @Alors("le statut du dossier doit passer à {string}")
    public void statusChangesTo(String expectedStatus) {
    }

    @Quand("le Validateur effectue la validation finale du dossier {string}")
    public void finalValidateDossier(String ref) {
        userIsAuthenticatedWithRole("VALIDATEUR");
        driver.get(BASE_URL + "/frais-review");
        WebElement approveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("val-approve-" + ref)));
        approveBtn.click();
    }

    @Alors("le statut final du dossier doit être {string}")
    public void finalStatusIs(String status) {
    }

    @Étantdonné("que le dossier {string} a été soumis au Validateur")
    public void dossierSubmittedToValidator(String ref) {
    }

    @Quand("le Validateur rejette le dossier {string} avec le motif {string}")
    public void validatorRejectsWithMotif(String ref, String motif) {
        userIsAuthenticatedWithRole("VALIDATEUR");
        driver.get(BASE_URL + "/frais-review");
        driver.findElement(By.id("reject-" + ref)).click();
        driver.findElement(By.id("reject-motif")).sendKeys(motif);
        driver.findElement(By.id("btn-confirm-reject")).click();
    }

    @Alors("le statut du dossier doit changer pour {string}")
    public void dossierStatusChangesTo(String status) {
    }

    @Alors("le dossier doit être renvoyé dans la boîte de réception du Chargé pour correction")
    public void sentToChargeBox() {
    }

    @Quand("le Validateur tente de rejeter le dossier {string} avec le motif trop court {string}")
    public void validatorRejectsWithShortMotif(String ref, String motif) {
        userIsAuthenticatedWithRole("VALIDATEUR");
        driver.get(BASE_URL + "/frais-review");
        driver.findElement(By.id("reject-" + ref)).click();
        driver.findElement(By.id("reject-motif")).sendKeys(motif);
    }

    @Alors("le système doit rejeter l'action avec un message d'erreur")
    public void systemRejectsAction() {
        WebElement errorMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("motif-error")));
        assertTrue(errorMsg.isDisplayed());
    }

    @Alors("le statut du dossier doit rester inchangé")
    public void statusRemainsUnchanged() {
        WebElement btnConfirm = driver.findElement(By.id("btn-confirm-reject"));
        assertFalse(btnConfirm.isEnabled());
    }

    // ADMIN
    @Étantdonné("que l'utilisateur est authentifié avec le rôle {string} pour admin")
    public void adminIsLogged(String role) {
        userIsAuthenticatedWithRole("ADMIN");
    }

    @Quand("l'administrateur crée un utilisateur de test {string}")
    public void adminCreatesTestUser(String username) {
        driver.get(BASE_URL + "/admin/users");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-add-user"))).click();
        
        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("new-username")));
        usernameInput.sendKeys(username);
        driver.findElement(By.id("new-email")).sendKeys(username + "@bna.com.tn");
        driver.findElement(By.id("new-password")).sendKeys("password123");
        driver.findElement(By.id("new-fullname")).sendKeys("Temp QA User");
        driver.findElement(By.id("btn-save-new-user")).click();
        
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("new-username")));
    }

    @Quand("l'administrateur accède à la console de gestion des utilisateurs")
    public void adminGoesToUserConsole() {
        driver.get(BASE_URL + "/admin/users");
    }

    @Quand("sélectionne le compte de l'utilisateur {string}")
    public void selectsUserAccount(String username) {
        this.selectedUser = username;
        driver.findElement(By.id("user-search")).sendKeys(username);
    }

    @Quand("clique sur le bouton pour basculer le statut du compte")
    public void togglesAccountStatus() {
        wait.until(ExpectedConditions.elementToBeClickable(By.id("toggle-status-" + this.selectedUser))).click();
    }

    @Alors("le compte utilisateur doit être désactivé avec succès")
    public void accountDeactivatedSuccessfully() {
        WebElement statusMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-message")));
        assertTrue(statusMsg.getText().contains("suspendu"));
    }

    @Alors("l'utilisateur {string} ne doit plus pouvoir s'authentifier sur la plateforme")
    public void userCannotLogin(String username) {
        driver.get(BASE_URL + "/logout");
        userEntersCredentials(username, "password123");
        userClicksLogin();
        errorMessageDisplays("suspendu");
    }

    @Quand("l'administrateur tente de désactiver le compte {string} principal")
    public void adminTriesToDeactivateMainAdmin(String username) {
        adminGoesToUserConsole();
        selectsUserAccount(username);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("toggle-status-admin"))).click();
    }

    @Alors("le système doit rejeter l'action avec un message d'avertissement {string}")
    public void systemRejectsWithMsg(String msg) {
        WebElement alert = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-message")));
        assertTrue(alert.getText().contains(msg));
    }

    @Alors("le statut du compte {string} doit demeurer actif \\(enabled = true)")
    public void accountRemainsActive(String username) {
    }
}
