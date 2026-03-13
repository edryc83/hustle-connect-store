/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Afristall login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://rmhpdalhkcbsbrphhjre.supabase.co/storage/v1/object/public/email-assets/logo.png" width="48" height="48" alt="Afristall" style={logo} />
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click below to sign in to Afristall. This link will expire shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Sign In
        </Button>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#1a1d23', fontFamily: "'Poppins', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '480px', margin: '0 auto' }
const logo = { marginBottom: '24px', borderRadius: '12px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 28px' }
const button = { backgroundColor: '#ff6b35', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '32px 0 0' }
