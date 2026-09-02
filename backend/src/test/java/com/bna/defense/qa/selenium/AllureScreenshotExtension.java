package com.bna.defense.qa.selenium;

import io.qameta.allure.Allure;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

import java.io.ByteArrayInputStream;

public class AllureScreenshotExtension implements TestWatcher {

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        if (BnaDefenseE2ETest.driver != null) {
            byte[] screenshot = ((TakesScreenshot) BnaDefenseE2ETest.driver).getScreenshotAs(OutputType.BYTES);
            Allure.addAttachment("Capture d'écran sur échec", "image/png", new ByteArrayInputStream(screenshot), ".png");
        }
    }
}
