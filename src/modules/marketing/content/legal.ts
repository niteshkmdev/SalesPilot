export const LEGAL_CONTACT_EMAIL = "support@salespilot.app";
export const LEGAL_LAST_UPDATED = "July 25, 2026";

export const legalDisclaimer =
  "This document is a product template for SalesPilot’s MVP and Google OAuth verification. It is not formal legal advice. Replace or review with counsel before relying on it in production.";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const privacySections: LegalSection[] = [
  {
    title: "1. Who we are",
    paragraphs: [
      "SalesPilot is a multi-tenant CRM application that helps teams capture, assign, and manage sales leads within an organization workspace.",
      "This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use SalesPilot.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "Account information: name, email address, password credentials (stored hashed by our authentication provider), and profile image if you provide one.",
      "Google OAuth information: when you sign in with Google, we receive basic profile details such as your name, email address, and profile image from Google, solely to create or authenticate your SalesPilot account.",
      "Organization and membership data: organization name, slug, roles, invitations, and membership relationships needed to run your workspace.",
      "CRM content: leads, notes, statuses, sources, and related workspace data you or your teammates create in SalesPilot.",
      "Usage and technical data: standard logs such as IP address, browser type, timestamps, and error diagnostics used to operate and secure the service.",
    ],
  },
  {
    title: "3. How we use Google account data",
    paragraphs: [
      "Google account data is used only to authenticate you and populate your SalesPilot user profile.",
      "We do not sell Google user data. We do not use Google user data for advertising. We do not share Google user data with third parties for advertising or unrelated analytics products.",
      "If you disconnect Google sign-in or delete your account, we stop using Google-provided profile data for authentication according to our retention practices below.",
    ],
  },
  {
    title: "4. How we use information",
    paragraphs: [
      "We use personal and workspace data to provide the SalesPilot service, authenticate users, maintain organization memberships, store CRM records, send transactional emails (such as verification or password reset), improve reliability, and protect against abuse.",
    ],
  },
  {
    title: "5. Sharing",
    paragraphs: [
      "We may share information with infrastructure providers that host our application, database, email delivery, or authentication services, only as needed to operate SalesPilot.",
      "We may disclose information if required by law or to protect the rights, safety, or security of users and the service.",
      "We do not sell personal information.",
    ],
  },
  {
    title: "6. Retention and deletion",
    paragraphs: [
      "We retain account and workspace data while your account remains active and as needed to provide the service.",
      "If your membership in an organization ends, you may lose access to that organization’s CRM data. If you create a new workspace, a new organization context is provisioned for your account.",
      "You may request account-related deletion by contacting us at the email below. Some logs may be retained for a limited period for security and operational integrity.",
    ],
  },
  {
    title: "7. Security",
    paragraphs: [
      "We use industry-standard practices appropriate for an MVP SaaS product, including encrypted transport (HTTPS), hashed passwords via our auth provider, and organization-scoped data access controls.",
      "No method of transmission or storage is completely secure. Please use a strong password and protect access to your email account.",
    ],
  },
  {
    title: "8. Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, or delete personal information, or to object to certain processing. Contact us to make a request.",
      "You can update basic profile details in SalesPilot settings where available.",
    ],
  },
  {
    title: "9. Children’s privacy",
    paragraphs: [
      "SalesPilot is intended for business use and is not directed to children under 16. We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "10. Contact",
    paragraphs: [
      `For privacy questions or requests, email ${LEGAL_CONTACT_EMAIL}.`,
      `Last updated: ${LEGAL_LAST_UPDATED}.`,
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "1. Acceptance of terms",
    paragraphs: [
      "By creating an account, signing in, or using SalesPilot, you agree to these Terms of Service and our Privacy Policy.",
      "If you are using SalesPilot on behalf of an organization, you represent that you have authority to bind that organization to these terms.",
    ],
  },
  {
    title: "2. The service",
    paragraphs: [
      "SalesPilot provides organization workspaces for managing sales leads and related CRM workflows.",
      "Features may change as we iterate on the MVP. We may add, modify, or remove functionality without prior notice.",
    ],
  },
  {
    title: "3. Accounts and eligibility",
    paragraphs: [
      "You must provide accurate account information and keep your credentials secure.",
      "You are responsible for activity under your account, including actions taken by members you invite to your organization.",
      "You must be able to form a binding contract and use SalesPilot only for lawful business purposes.",
    ],
  },
  {
    title: "4. Organizations and multi-user workspaces",
    paragraphs: [
      "SalesPilot is multi-tenant. Data within an organization workspace is intended for that organization’s members according to assigned roles and permissions.",
      "Organization owners and admins are responsible for managing memberships, invitations, and access within their workspace.",
      "If you are removed from an organization, you may lose access to that organization’s data. You may create a new workspace if you have no remaining membership.",
    ],
  },
  {
    title: "5. Acceptable use",
    paragraphs: [
      "You agree not to misuse SalesPilot, including attempting to access other organizations’ data, reverse engineer the service, overload infrastructure, upload unlawful content, or use the product to spam or harass others.",
      "We may suspend or terminate access for violations or suspected abuse.",
    ],
  },
  {
    title: "6. Availability",
    paragraphs: [
      "SalesPilot is provided on an “as available” basis. The MVP does not include a formal uptime SLA.",
      "We may perform maintenance, migrations, or temporary interruptions.",
    ],
  },
  {
    title: "7. Intellectual property",
    paragraphs: [
      "SalesPilot, including its software, branding, and documentation, remains owned by its operators and licensors.",
      "You retain ownership of the content you submit to your workspace. You grant us a limited license to host and process that content solely to provide the service.",
    ],
  },
  {
    title: "8. Termination",
    paragraphs: [
      "You may stop using SalesPilot at any time.",
      "We may suspend or terminate accounts that violate these terms or that create risk to the service or other users.",
      "Upon termination, your right to access the service ends. Data handling after termination follows our Privacy Policy.",
    ],
  },
  {
    title: "9. Disclaimers and limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, SalesPilot is provided “as is” without warranties of any kind, express or implied.",
      "To the maximum extent permitted by law, the operators of SalesPilot are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or business interruption arising from your use of the service.",
    ],
  },
  {
    title: "10. Governing law",
    paragraphs: [
      "These terms are governed by the laws of the jurisdiction where the operator of SalesPilot is established, without regard to conflict-of-law principles, unless mandatory local law provides otherwise.",
    ],
  },
  {
    title: "11. Contact",
    paragraphs: [
      `Questions about these terms: ${LEGAL_CONTACT_EMAIL}.`,
      `Last updated: ${LEGAL_LAST_UPDATED}.`,
    ],
  },
];
