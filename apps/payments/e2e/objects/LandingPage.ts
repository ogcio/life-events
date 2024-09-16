import { type Page, type Locator, expect } from "@playwright/test";
import { landingPageUrl } from "../utils/constants";

export class LandingPage {
  private readonly headerCTA: Locator;
  private readonly footerCTA: Locator;
  private readonly header: Locator;
  private readonly feedbackLink: Locator;

  private readonly title = "Payments";
  private readonly headerBlockContent =
    "Our Payments Building Block is built on a robust infrastructure that enables secure and efficient financial transactions, giving users peace of mind every time they use it.";

  private readonly benefitsHeader = "Benefits";
  private readonly benefits = [
    {
      title: "Seamless Integration",
      description:
        "The Payments Building Block seamlessly connects with multiple payment methods, including credit cards, digital wallets, and bank transfers, to offer flexibility to your users.",
    },
    {
      title: "Enhanced Security",
      description:
        "The Payments Building Block employs encryption protocols and payment providers that are Payment Card Industry (PCI) compliant, giving you peace of mind.",
    },
    {
      title: "User-Friendly Interface",
      description:
        "The Payments Building Block has an intuitive interface that makes payment processing simple for both administrators and users. Whether you're generating payment requests or tracking transactions, it's quick and simple.",
    },
    {
      title: "Accessibility",
      description:
        "The Payments Building Block is designed with accessibility in mind. It conforms with the Web Content Accessibility Guidelines (WCAG) 2.0, ensuring that all users can easily access the service.",
    },
    {
      title: "Dedicated Support",
      description:
        "Our team of experts is here to assist you every step of the way. Whether you have technical questions or need assistance with implementation, you can rely on the Payments Building Block's dedicated support team.",
    },
  ];

  private readonly getStartedTitle = "Get Started";
  private readonly getStartedContent =
    "Ready to transform your payment processes? Contact us to schedule a demo or to learn more about how Payments Building Block can empower your public sector department.";

  constructor(public readonly page: Page) {
    this.headerCTA = this.page
      .getByRole("link", {
        name: "Sign up to learn more",
      })
      .nth(0);
    this.footerCTA = this.page
      .getByRole("link", {
        name: "Sign up to learn more",
      })
      .nth(1);
    this.header = this.page.getByRole("heading", {
      name: "Payments",
    });
    this.feedbackLink = this.page.getByRole("link", {
      name: "feedback",
    });
  }

  async goto(url?: string) {
    const gotoUrl = url ?? landingPageUrl;
    await this.page.goto(gotoUrl);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkCTA(link: string) {
    const hrefHeaderCTA = await this.headerCTA.getAttribute("href");
    const hrefFooterCTA = await this.footerCTA.getAttribute("href");
    await expect(this.headerCTA).toBeVisible();
    await expect(this.footerCTA).toBeVisible();
    await expect(hrefHeaderCTA).toEqual(link);
    await expect(hrefFooterCTA).toEqual(link);
  }

  async checkFeedbackLink(link: string) {
    await expect(this.feedbackLink).toBeVisible();
    const href = await this.feedbackLink.getAttribute("href");
    await expect(href).toEqual(link);
  }

  async checkHeaderBlock() {
    const headerContent = await this.header.textContent();
    await expect(headerContent).toEqual(this.title);
    await expect(this.page.getByText(this.headerBlockContent)).toBeVisible();
  }

  async checkBenefitsHeader() {
    const title = this.page.getByRole("heading", {
      name: this.benefitsHeader,
    });
    await expect(title).toBeVisible();
  }

  async checkBenefitsContent() {
    for (const benefit of this.benefits) {
      const title = this.page.getByRole("heading", {
        name: benefit.title,
      });
      const description = this.page.getByText(benefit.description);

      await expect(title).toBeVisible();
      await expect(description).toBeVisible();
    }
  }

  async checkGetStartedBlockContent() {
    const title = this.page.getByRole("heading", {
      name: this.getStartedTitle,
    });
    const content = this.page.getByText(this.getStartedContent);
    await expect(title).toBeVisible();
    await expect(content).toBeVisible();
  }
}
