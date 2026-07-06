"""Generate the Lexington Commons HOA Privacy Policy PDF into public/privacy-policy.pdf.

Run: python scripts/generate_privacy_policy.py
"""
from fpdf import FPDF

EFFECTIVE_DATE = "July 6, 2026"

SECTIONS = [
    (
        None,
        [
            "This Privacy Policy explains how Lexington Commons Homeowners Association "
            "(the \"HOA\", \"we\", \"us\") collects, uses, and protects your information "
            "when you use our website to pay dues or assessments and manage your account.",
        ],
    ),
    (
        "1. Information We Do Not Share",
        [
            "No Selling: We do not sell your personal information to anyone.",
            "No Marketing: We do not share your data with third parties for marketing "
            "purposes.",
            "Limited Sharing: We only share your information with our payment processor "
            "as needed to complete your transactions.",
        ],
    ),
    (
        "2. Payment Processing and Security",
        [
            "Third-Party Processing: We use Authorize.Net to process all credit card and "
            "electronic check payments securely.",
            "No Local Storage: Our website never stores, views, or retains your financial "
            "information, credit card numbers, or bank account details.",
            "Authorize.Net Storage: Your payment data is transmitted directly to "
            "Authorize.Net and is handled on their secure servers in accordance with "
            "their privacy and security practices.",
        ],
    ),
    (
        "3. Security & PCI Compliance",
        [
            "PCI-Compliant Processor: We use a PCI-DSS (Payment Card Industry Data "
            "Security Standard) compliant payment processor, Authorize.Net, to keep card "
            "transactions safe.",
            "Secure Encryption: Our website uses standard encryption technology "
            "(SSL/TLS) to protect your personal details during transmission.",
        ],
    ),
    (
        "4. Information We Collect",
        [
            "Contact Details: We only collect basic information needed to manage your "
            "account, such as your name, property address, email address, and phone "
            "number.",
            "Transaction Records: We keep a record of your payment confirmation numbers "
            "and payment history for association accounting purposes.",
            "Cookies: We use only the cookies necessary to keep you securely signed in "
            "and to operate the website. We do not use advertising or third-party "
            "tracking cookies.",
        ],
    ),
    (
        "5. Data Retention",
        [
            "We retain your contact details and payment history only as long as needed to "
            "manage your account and meet the association's accounting, legal, and "
            "record-keeping obligations.",
        ],
    ),
    (
        "6. Your Rights",
        [
            "You may request access to, or correction of, the contact information we hold "
            "about you by contacting the HOA Board or management team through our "
            "website's contact page.",
        ],
    ),
    (
        "7. Children's Privacy",
        [
            "Our website is intended for homeowners and residents and is not directed to "
            "children under 13. We do not knowingly collect personal information from "
            "children.",
        ],
    ),
    (
        "8. Changes to This Policy",
        [
            "We may update this Privacy Policy from time to time. When we do, we will "
            "revise the Effective Date shown above and post the updated policy on this "
            "page.",
        ],
    ),
    (
        "9. Contact Us",
        [
            "If you have any questions about this Privacy Policy, please contact the HOA "
            "Board or management team through our website's contact page.",
        ],
    ),
]


def main():
    pdf = FPDF(format="Letter", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(20, 20, 20)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 10, "Privacy Policy", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, "Lexington Commons Homeowners Association",
             new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "I", 10)
    pdf.cell(0, 7, f"Effective Date: {EFFECTIVE_DATE}",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    for heading, paragraphs in SECTIONS:
        if heading:
            pdf.set_font("Helvetica", "B", 13)
            pdf.multi_cell(0, 7, heading)
            pdf.ln(1)
        for para in paragraphs:
            pdf.set_font("Helvetica", "", 11)
            pdf.multi_cell(0, 6, para)
            pdf.ln(1)
        pdf.ln(2)

    out = "public/privacy-policy.pdf"
    pdf.output(out)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
