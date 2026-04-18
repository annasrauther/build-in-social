/**
 * Legal content — Privacy Policy and Terms of Service source strings.
 *
 * DRAFT — NOT LEGALLY REVIEWED. Do not ship without counsel sign-off.
 *
 * All `[BRACKETED_PLACEHOLDERS]` require founder/counsel decision before launch.
 * See the top of each page for the prominent banner rendered to users.
 */

export const LEGAL = {
  META: {
    lastUpdated: "April 18, 2026",
    contactEmail: "privacy@buildinsocial.com",
    legalEmail: "legal@buildinsocial.com",
    dpoEmail: "dpo@buildinsocial.com",
    companyName: "Build In Social",
    // TODO: counsel + founder must fill these before launch
    companyLegalEntity: "[COMPANY LEGAL ENTITY]",
    companyAddress: "[REGISTERED ADDRESS]",
    countryOfIncorporation: "[COUNTRY OF INCORPORATION]",
    governingLaw: "[CHOOSE JURISDICTION]",
    disputeResolution: "[CHOOSE: arbitration seat / courts of competent jurisdiction]",
    euRepresentative:
      "[APPOINT IF >250 EMPLOYEES OR PROCESSING SENSITIVE DATA AT SCALE]",
  },

  DRAFT_BANNER: {
    title: "DRAFT — NOT LEGALLY REVIEWED",
    body: "These terms are a working draft generated from a compliance template. They have not been reviewed by counsel. Do not treat as legal advice and do not ship to production without sign-off from a qualified attorney in your operating jurisdiction.",
  },

  /* --------------------------------------------------------------------- */
  /*  Subprocessor table (shared between privacy + DPA)                     */
  /* --------------------------------------------------------------------- */

  SUBPROCESSORS: [
    {
      name: "Clerk",
      purpose: "Authentication, session management, user identity",
      dataTypes: "Email, name, password hash, session tokens",
      region: "United States",
    },
    {
      name: "Stripe",
      purpose: "Subscription billing, payment processing, invoicing",
      dataTypes: "Billing name, address, last-4 card digits, VAT/tax ID",
      region: "United States / European Union",
    },
    {
      name: "Anthropic (Claude API)",
      purpose: "Script generation, quality gate, pSEO article drafting",
      dataTypes:
        "User prompts, niche context, platform preferences (no account identifiers sent)",
      region: "United States",
    },
    {
      name: "ElevenLabs",
      purpose: "Voice cloning and text-to-speech synthesis",
      dataTypes: "Voice samples, synthesized audio, voice clone IDs",
      region: "United States",
    },
    {
      name: "Cloudflare R2",
      purpose: "Storage of rendered videos, voice samples, and thumbnails",
      dataTypes: "Video files, audio files, image assets",
      region: "Global (multi-region)",
    },
    {
      name: "Resend",
      purpose: "Transactional email (welcome, weekly digest, password reset)",
      dataTypes: "Email address, email content",
      region: "United States",
    },
    {
      name: "Upstash Redis",
      purpose: "Job queue, rate limiting, short-lived caches",
      dataTypes: "Job payloads, request metadata (pseudonymous)",
      region: "Global (multi-region)",
    },
    {
      name: "NoCodeBackend",
      purpose: "Primary application database (user records, plans, videos)",
      dataTypes: "Account data, content metadata, subscription state",
      region: "[REGION TBD — confirm with vendor before launch]",
    },
    {
      name: "Pexels",
      purpose: "Stock b-roll media for faceless videos",
      dataTypes:
        "Search queries (niche/topic keywords). No personal data is transmitted.",
      region: "United States",
    },
  ],

  /* --------------------------------------------------------------------- */
  /*  Privacy Policy sections                                               */
  /* --------------------------------------------------------------------- */

  PRIVACY: {
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how Build In Social collects, uses, shares, and protects personal data when you use our service at buildinsocial.com (the \"Service\"). It applies to account holders, trial users, and visitors. We are committed to the GDPR, the UK GDPR, and the California Consumer Privacy Act (CCPA) as applicable.",

    controller: {
      heading: "1. Data Controller",
      body: "The data controller responsible for your personal data is [COMPANY LEGAL ENTITY], operating as Build In Social, registered at [REGISTERED ADDRESS], [COUNTRY OF INCORPORATION]. You can reach our privacy team at privacy@buildinsocial.com.",
    },

    dataWeCollect: {
      heading: "2. What Data We Collect",
      categories: [
        {
          label: "Account data",
          body: "Email, name, password hash (via Clerk), profile image, timezone.",
        },
        {
          label: "Content data",
          body: "Your niche, manual-mode prompts, generated scripts, approved videos, and pSEO articles you create.",
        },
        {
          label: "Voice samples",
          body: "Audio you record or upload for voice cloning via ElevenLabs. Voice samples are treated as sensitive and processed under explicit consent.",
        },
        {
          label: "Usage and analytics",
          body: "Pages viewed, features used, feature adoption events, crash/error telemetry. We use first-party analytics; we do not sell analytics data to third parties.",
        },
        {
          label: "Billing",
          body: "Billing name, address, VAT/tax ID if provided, and last-4 card digits. Full card numbers are stored by Stripe and never reach our servers.",
        },
        {
          label: "Connected-platform data",
          body: "OAuth tokens for YouTube, Instagram, LinkedIn, and X (only when you connect them), plus post status and basic engagement metrics returned by each platform.",
        },
      ],
    },

    lawfulBasis: {
      heading: "3. Lawful Basis for Processing (GDPR Art. 6)",
      body: "We process your data on the following bases:",
      bullets: [
        "Contract (Art. 6(1)(b)) — to provide the Service you signed up for: generating, rendering, and distributing content.",
        "Legitimate interest (Art. 6(1)(f)) — to secure our systems, prevent fraud, analyze aggregate usage, and improve the product. You may object at any time.",
        "Consent (Art. 6(1)(a)) — for voice cloning, optional marketing communications, and any processing of special-category data. You may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.",
        "Legal obligation (Art. 6(1)(c)) — to meet tax, accounting, and regulatory requirements.",
      ],
    },

    subprocessors: {
      heading: "4. Subprocessors",
      body: "We use the following subprocessors to deliver the Service. Each is bound by a data-processing agreement with confidentiality, security, and onward-transfer obligations at least as strict as ours. We will provide at least 30 days' notice via email before adding or replacing a subprocessor that materially changes the processing of your data.",
    },

    doNotTrain: {
      heading: "5. We Do Not Train Our AI Models on Your Content",
      body: "Your scripts, prompts, voice samples, videos, and pSEO pages are not used to train any AI model — ours, our subprocessors', or anyone else's. Our prompts to Anthropic and ElevenLabs are sent with provider-level no-training flags where the provider supports them, and we do not grant training rights to any subprocessor. If this ever changes we will obtain your explicit opt-in consent first; it will never be bundled into a Terms update.",
    },

    userRights: {
      heading: "6. Your Rights",
      bodyGdpr:
        "If you are in the EU, UK, or Switzerland you have the right to access, rectify, erase, restrict, port, or object to the processing of your personal data, and to lodge a complaint with your local supervisory authority. You can exercise most rights from your account settings; otherwise contact privacy@buildinsocial.com and we will respond within 30 days.",
      bodyCcpa:
        "If you are a California resident, you have the right to know what personal information we have collected, to delete it, to correct it, and to opt out of the \"sale\" or \"sharing\" of personal information. Build In Social does not sell personal information and does not share it for cross-context behavioral advertising.",
      selfServe:
        "Self-serve account deletion is available at Settings → Account → Delete account. Deletion removes your account, generated content, and voice clones from production systems immediately and from encrypted backups within 90 days.",
    },

    retention: {
      heading: "7. Data Retention",
      bullets: [
        "Account data is retained for the life of your account.",
        "Voice samples and voice clones are deleted immediately when you delete your account or the individual clone.",
        "Generated videos and pSEO pages are retained for the life of your subscription and for 30 days after cancellation so you can export them.",
        "Encrypted backups are purged within 90 days of account deletion.",
        "Billing records are retained for the period required by tax law in our operating jurisdiction (typically 7 to 10 years).",
        "Rate-limit and fraud-prevention logs are retained for 90 days.",
      ],
    },

    internationalTransfers: {
      heading: "8. International Data Transfers",
      body: "Our subprocessors operate in the United States, the European Union, and globally. Where personal data leaves the EEA, UK, or Switzerland, we rely on the European Commission's Standard Contractual Clauses (SCCs), the UK International Data Transfer Addendum, or an applicable adequacy decision. A copy of the relevant transfer mechanism is available on request from privacy@buildinsocial.com.",
    },

    children: {
      heading: "9. Children's Data",
      body: "Build In Social is not directed to children. We do not knowingly collect personal data from anyone under 13 years old (or under 16 where local law sets a higher minimum, such as in parts of the EU). If you believe a child has created an account, contact privacy@buildinsocial.com and we will delete the account promptly.",
    },

    security: {
      heading: "10. Security",
      body: "We encrypt data in transit with TLS 1.2+ and at rest with AES-256 (provider-managed where applicable). Access to production systems is least-privilege, audit-logged, and gated behind SSO + hardware 2FA for engineering staff. Secrets are stored in a dedicated secrets manager and rotated on a scheduled cadence. We run automated vulnerability scans on our dependencies and container images. No system is unbreakable; we practice defense in depth and continue to invest in hardening.",
    },

    breachNotification: {
      heading: "11. Breach Notification",
      body: "If we become aware of a personal-data breach likely to result in risk to your rights and freedoms, we will notify the competent supervisory authority within 72 hours in line with GDPR Art. 33, and we will notify affected users without undue delay where required by Art. 34. Our notice will describe the nature of the breach, the likely consequences, and the measures we have taken to address it.",
    },

    dpo: {
      heading: "12. Data Protection Officer and EU Representative",
      body: "You can contact our privacy team at privacy@buildinsocial.com. A formal Data Protection Officer and EU representative are [APPOINT IF >250 EMPLOYEES OR PROCESSING SENSITIVE DATA AT SCALE]; this page will be updated when appointments are confirmed.",
    },

    changes: {
      heading: "13. Changes to This Policy",
      body: "If we make material changes, we will notify account holders by email at least 14 days before the changes take effect. The \"Last updated\" date at the top of this page always reflects the current version.",
    },

    contact: {
      heading: "14. Contact",
      body: "Questions, requests, or complaints about this policy should be sent to privacy@buildinsocial.com. For matters specific to the EU or UK, you may also reach our DPO placeholder at dpo@buildinsocial.com.",
    },
  },

  /* --------------------------------------------------------------------- */
  /*  Terms of Service sections                                             */
  /* --------------------------------------------------------------------- */

  TERMS: {
    title: "Terms of Service",
    intro:
      "These Terms of Service (\"Terms\") form a binding agreement between you and [COMPANY LEGAL ENTITY] d/b/a Build In Social (\"Build In Social,\" \"we,\" \"us\") governing your access to and use of buildinsocial.com and related services (the \"Service\"). Please read them carefully.",

    acceptance: {
      heading: "1. Acceptance of Terms",
      body: "By creating an account, clicking \"I agree,\" or using the Service, you accept these Terms and our Privacy Policy. If you are using the Service on behalf of a company, you represent that you have authority to bind that company, and \"you\" refers to that entity.",
    },

    serviceDescription: {
      heading: "2. Description of Service",
      body: "Build In Social is an AI-assisted social-distribution partner for indie developers and SaaS founders. The Service generates platform-native short-form video content, optional AI voice clones, and pSEO articles, and can publish them to connected platforms (YouTube Shorts, Instagram Reels, LinkedIn, X). Features, limits, and supported platforms may evolve; material changes are notified per Section 13.",
    },

    accounts: {
      heading: "3. User Accounts",
      body: "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate information, keep it up to date, and notify us immediately of any unauthorized access at security@buildinsocial.com. One person or entity per account.",
    },

    acceptableUse: {
      heading: "4. Acceptable Use",
      intro: "You agree not to:",
      bullets: [
        "Use the Service to generate or distribute illegal content, content that infringes intellectual property, defamatory content, or content that targets, harasses, or impersonates any individual.",
        "Clone the voice of any person without their verifiable, written consent. You represent that any voice sample you upload is your own voice or a voice you have explicit rights to clone.",
        "Use the Service to generate content that violates the rules of any connected platform (YouTube, Instagram, LinkedIn, X).",
        "Scrape, reverse engineer, or circumvent rate limits, authentication, or billing.",
        "Resell, sublicense, or provide the Service to third parties as a white-labeled offering without a separate written agreement.",
        "Use the Service to generate CSAM, terrorist content, non-consensual sexual content, malware, or content intended to mislead voters about elections.",
      ],
    },

    subscription: {
      heading: "5. Subscription, Billing, and Trial",
      bullets: [
        "Build In Social is offered on Solo ($39/mo), Creator ($79/mo), and Studio ($149/mo) subscription tiers. Current pricing and feature limits are listed on the Pricing page and incorporated into these Terms.",
        "New accounts are eligible for a 14-day free trial. We require a valid payment method to start the trial. If you do not cancel before the trial ends, your paid subscription begins automatically at the chosen tier.",
        "Subscriptions renew automatically at the end of each billing period (monthly or annual) at the then-current rate. You can cancel at any time from Settings → Billing; cancellation takes effect at the end of the current paid period.",
        "Invoices include your billing-address VAT/tax number if provided. EU/UK VAT is applied per reverse-charge rules for B2B with a valid VAT ID. You are responsible for any taxes not collected by us.",
        "Refunds: [CHOOSE — pro-rated refund on cancellation OR no-refund policy except where required by law]. Either choice must be reflected consistently here before launch.",
      ],
    },

    contentOwnership: {
      heading: "6. Content Ownership and License",
      ownership:
        "You own your generated scripts, videos, voice clones, and pSEO pages. That output is yours. We grant ourselves only a limited, non-exclusive license to host, process, render, and deliver your content for the sole purpose of operating the Service. This license terminates when you delete the content or close your account.",
      noTraining:
        "We do not use your content, prompts, or voice samples to train AI models (ours or any third party's). See the Privacy Policy for details.",
      portability:
        "You can export your generated videos and pSEO pages at any time while your account is active and for 30 days after cancellation.",
    },

    limitation: {
      heading: "7. Limitation of Liability",
      body: "To the maximum extent permitted by law, neither party will be liable for indirect, incidental, special, consequential, or exemplary damages, or for lost profits, lost revenue, or lost data, even if advised of the possibility. Our total aggregate liability arising out of or related to these Terms will not exceed the fees you paid to Build In Social in the twelve (12) months preceding the event giving rise to the claim. Nothing in this section limits liability that cannot be limited under applicable law (e.g., gross negligence, willful misconduct, death or personal injury, or consumer-protection rights).",
    },

    indemnification: {
      heading: "8. Indemnification",
      body: "You will defend, indemnify, and hold harmless Build In Social and its personnel from any third-party claim arising out of (a) content you submit, generate, or publish through the Service; (b) your misuse of the Service; (c) your violation of these Terms; or (d) your violation of applicable law, including platform rules of any connected social network.",
    },

    termination: {
      heading: "9. Termination",
      body: "You may terminate your account at any time from Settings → Account. We may suspend or terminate your access if you materially breach these Terms, create risk or legal exposure for us, or fail to pay. We will provide reasonable notice where practical. On termination, your right to use the Service ends and we will delete your data per the retention schedule in the Privacy Policy.",
    },

    dpa: {
      heading: "10. Data Processing Addendum",
      body: "A Data Processing Addendum (DPA) incorporating the EU Standard Contractual Clauses and the UK International Data Transfer Addendum is available on request to legal@buildinsocial.com. The DPA is incorporated by reference when executed.",
    },

    sla: {
      heading: "11. Service Level",
      body: "Paid subscriptions target [DRAFT 99.9% FOR PAID TIERS] monthly uptime measured against the availability of the core content-generation and publishing APIs. Planned maintenance, third-party platform outages, and force majeure are excluded. A credits-based SLA remedy will be published before GA.",
    },

    governingLaw: {
      heading: "12. Governing Law and Dispute Resolution",
      body: "These Terms are governed by the laws of [CHOOSE JURISDICTION], without regard to conflict-of-laws rules. Disputes will be resolved by [CHOOSE: binding arbitration in [seat] / the courts of [seat]]. Nothing in this section prevents either party from seeking injunctive relief in any competent court to protect intellectual property or confidential information.",
    },

    changes: {
      heading: "13. Changes to These Terms",
      body: "We may update these Terms from time to time. Material changes will be announced by email and in-app at least 14 days before taking effect. Continued use of the Service after the effective date means you accept the updated Terms.",
    },

    contact: {
      heading: "14. Contact",
      body: "Questions about these Terms? Email legal@buildinsocial.com.",
    },
  },
} as const;
