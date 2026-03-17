import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import * as React from "react";

export const NewsletterWelcomeTemplate = ({ email = "" }) => (
  <Html>
    <Head />
    <Preview>Welcome to the myFit newsletter! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⠿ myFit</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={heading}>You're in! 🎉</Heading>
          <Hr style={hr} />
          <Text style={body}>
            Hey there,
          </Text>
          <Text style={body}>
            Thanks for subscribing to the <strong>myFit newsletter</strong>! You've just joined a community focused on fitness, wellness, and results.
          </Text>
          <Text style={body}>
            Here's what you can expect:
          </Text>
          <Text style={listItem}>💪 &nbsp; Exclusive workout tips & new programs</Text>
          <Text style={listItem}>🥗 &nbsp; Nutrition advice and healthy recipes</Text>
          <Text style={listItem}>🎁 &nbsp; Early access to discounts & new products</Text>
          <Text style={listItem}>📣 &nbsp; Updates directly from your trainer</Text>

          <Hr style={hr} />

          <Text style={body}>
            Ready to start your journey?
          </Text>

          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button style={ctaButton} href="https://myfit.com/home2">
              Explore myFit
            </Button>
          </Section>

          <Text style={footNote}>
            You subscribed with <strong>{email}</strong>. If this wasn't you, you can safely ignore this email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© myFit 2026. All rights reserved.</Text>
          <Text style={footerText}>Sent by the myFit team.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewsletterWelcomeTemplate;

// ─── Styles ───────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f4f4f7",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "40px auto",
  padding: "20px",
  width: "600px",
  maxWidth: "100%",
};

const header = {
  padding: "30px 0",
  textAlign: "center",
};

const logo = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1a1a1a",
  letterSpacing: "2px",
  margin: "0",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  border: "1px solid #eaeaec",
};

const heading = {
  fontSize: "28px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
  marginTop: "0",
  marginBottom: "20px",
  textAlign: "center",
};

const hr = {
  borderColor: "#eaeaec",
  margin: "20px 0",
};

const body = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
};

const listItem = {
  color: "#4a4a4a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "6px 0",
  paddingLeft: "8px",
};

const ctaButton = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: "999px",
  display: "inline-block",
};

const footNote = {
  color: "#999999",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center",
  marginTop: "24px",
};

const footer = {
  padding: "30px 0",
  textAlign: "center",
};

const footerText = {
  color: "#999999",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
};
