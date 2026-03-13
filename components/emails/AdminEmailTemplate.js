import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Col,
} from "@react-email/components";
import * as React from "react";

export const AdminEmailTemplate = ({
  subject = "Message from Admin",
  htmlContent = "",
  isPreview = false
}) => {
  const contentBody = (
    <Container style={container}>
      <Section style={header}>
        <Text style={logo}>myfit</Text>
      </Section>

      <Section style={content}>
        <Heading style={heading}>{subject}</Heading>
        <Hr style={hr} />
        <div
          style={emailBody}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Section>

      <Section style={footer}>
        <Text style={footerText}>
          This email was sent by the myFit panel.
        </Text>
        <Text style={footerText}>
          © myFit. All rights reserved.
        </Text>
      </Section>
    </Container>
  );

  if (isPreview) {
    return <div style={main}>{contentBody}</div>;
  }

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        {contentBody}
      </Body>
    </Html>
  );
};

export default AdminEmailTemplate;

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
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1a1a1a",
  letterSpacing: "2px",
  margin: "0",
  fontFamily: "'Figtree', sans-serif"
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  border: "1px solid #eaeaec",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
  marginTop: "0",
  marginBottom: "20px",
  textAlign: "center",
  padding: "20px",
};

const hr = {
  borderColor: "#eaeaec",
  margin: "20px 0",
};

const emailBody = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "20px",
  textAlign: "center",
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
