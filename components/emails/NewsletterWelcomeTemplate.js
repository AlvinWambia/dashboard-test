import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

export const NewsletterWelcomeTemplate = ({ name = "[name]" }) => (
  <Html>
    <Head />
    <Preview>Welcome to the myfit newsletter!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header Section */}
        <Section style={header}>
          <Text style={smallLogo}>myfit</Text>
          <Heading style={heading}>Newsletter</Heading>
          <Text style={paragraph}>
            Thanks for subscribing to the myfit newsletter!
            <br />
            You've just joined a community focused on fitness,
            <br />
            wellness and results.
          </Text>
          <Button style={buttonSmall} href="https://myfitraining.com">
            Explore myfit
          </Button>
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <div style={heroContentWrapper}>
            <Text style={heroText}>myfit</Text>
            <Text style={heroTextVertical}>myfit</Text>
          </div>
        </Section>

        {/* Bottom Section */}
        <Section style={bottomSection}>
          <Text style={greeting}>Hi, {name}</Text>
          <Text style={paragraphBottom}>
            You can expect exclusive workout
            <br />
            tips, fitness programs, nutrition
            <br />
            advice , early access on information
            <br />
            about new programs
          </Text>
          <Button style={buttonLarge} href="https://dashboard-test-3i3q.vercel.app/programs">
            Explore Programs
          </Button>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewsletterWelcomeTemplate;

// ─── Styles ───────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f4f4f4",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  margin: "0 auto",
  backgroundColor: "#ffffff",
  width: "100%",
  maxWidth: "600px",
  padding: "0",
};

const header = {
  padding: "40px 20px 30px",
  textAlign: "center",
};

const smallLogo = {
  fontSize: "12px",
  margin: "0 0 10px",
  color: "#000000",
  fontWeight: "500",
  textAlign: "center",
};

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 15px",
  color: "#000000",
  textAlign: "center",
};

const paragraph = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#000000",
  margin: "0 auto 20px",
  textAlign: "center",
};

const buttonSmall = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "10px",
  padding: "10px 24px",
  borderRadius: "20px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "bold",
  textAlign: "center",
};

const heroSection = {
  backgroundColor: "#C6CED7", // Grey-blue color matching the image
  height: "250px",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  textAlign: "center",
};

const heroContentWrapper = {
  position: "relative",
  width: "100%",
  height: "250px",
};

const heroText = {
  fontSize: "72px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "-2px",
  lineHeight: "250px",
  textAlign: "center",
  display: "inline-block",
};

const heroTextVertical = {
  position: "absolute",
  right: "-60px",
  top: "50%",
  fontSize: "100px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "-2px",
  transform: "translateY(-50%) rotate(-90deg)",
  opacity: 1,
  display: "inline-block",
};

const bottomSection = {
  padding: "40px 20px 60px",
  textAlign: "center",
};

const greeting = {
  fontSize: "18px",
  color: "#000000",
  margin: "0 0 15px",
  fontWeight: "500",
  textAlign: "center",
};

const paragraphBottom = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#000000",
  margin: "0 auto 25px",
  fontWeight: "500",
  textAlign: "center",
};

const buttonLarge = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "12px",
  padding: "14px 32px",
  borderRadius: "24px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "bold",
  textAlign: "center",
};
