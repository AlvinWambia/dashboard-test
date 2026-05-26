import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const WelcomeEmailTemplate = ({
  name = "User",
  isPreview = false
}) => {
  const contentBody = (
    <Container style={container}>
      {/* Top Header */}
      <Section style={header}>
        <Text style={logo}>myfit</Text>
      </Section>

      {/* Main Content (Top) */}
      <Section style={contentTop}>
        <Heading style={heading}>WELCOME</Heading>
        <Text style={subtitle}>
          Introducing you to the best fitness program, giving you the best and getting the absolute best out of you.
        </Text>
        <Section style={buttonContainer}>
          <Button href="https://myfitraining.com" style={button}>
            Explore myfit
          </Button>
        </Section>
      </Section>

      {/* Hero Banner Section */}
      <Section style={heroBanner}>
        <Text style={heroText}>myfit</Text>
      </Section>

      {/* Main Content (Bottom) */}
      <Section style={contentBottom}>
        <Text style={greeting}>Hi, {name}</Text>
        <Text style={bodyText}>
          Thanks for joining myfit , we hope we can offer you the services you require.
        </Text>
        <Section style={buttonContainer}>
          <Button href="https://myfitraining.com/programs" style={button}>
            Explore Programs
          </Button>
        </Section>
      </Section>
    </Container>
  );

  if (isPreview) {
    return <div style={main}>{contentBody}</div>;
  }

  return (
    <Html>
      <Head />
      <Preview>Welcome to myFit!</Preview>
      <Body style={main}>
        {contentBody}
      </Body>
    </Html>
  );
};

export default WelcomeEmailTemplate;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  width: "100%",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
};

const header = {
  paddingTop: "40px",
  paddingBottom: "10px",
  textAlign: "center",
};

const logo = {
  fontSize: "14px",
  color: "#1a1a1a",
  margin: "0",
};

const contentTop = {
  textAlign: "center",
  padding: "0 40px 30px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.2",
  fontWeight: "900",
  color: "#000000",
  margin: "10px 0",
  letterSpacing: "1px",
};

const subtitle = {
  fontSize: "12px",
  lineHeight: "1.4",
  color: "#000000",
  margin: "15px auto",
  maxWidth: "300px",
};

const buttonContainer = {
  marginTop: "20px",
  marginBottom: "10px",
  textAlign: "center",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "20px",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  padding: "8px 24px",
};

const heroBanner = {
  backgroundColor: "#b4bccb",
  padding: "90px 0",
  textAlign: "center",
};

const heroText = {
  fontSize: "80px",
  fontWeight: "800",
  color: "#ffffff",
  margin: "0",
  lineHeight: "1",
  letterSpacing: "-2px",
};

const contentBottom = {
  textAlign: "center",
  padding: "40px 40px 60px",
};

const greeting = {
  fontSize: "18px",
  color: "#000000",
  margin: "0 0 15px 0",
};

const bodyText = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#000000",
  margin: "0 auto 30px",
  fontWeight: "500",
  maxWidth: "380px",
};
