'use client'

// import { useState } from 'react'
import getStripe from '../utils/get-stripe.js'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import {
  AppBar,
  Toolbar,
  Button, 
  Typography,
  Container,
  Grid,
  Box,
} from '@mui/material';

export default function Home() {
    const handleSubmit = async () => {
        const checkoutSession = await fetch('/api/checkout_sessions', {
          method: 'POST',
          headers: { origin: 'http://localhost:3000' },
        })
        const checkoutSessionJson = await checkoutSession.json()
      
        const stripe = await getStripe()
        const {error} = await stripe.redirectToCheckout({
          sessionId: checkoutSessionJson.id,
        })
      
        if (error) {
          console.warn(error.message)
        }
      }

  return (
    <main>
    <AppBar position="static">
        <Toolbar >
          <Typography variant="h6" style={{flexGrow: 1}}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">Login</Button>
            <Button color="inherit" href="/sign-up">Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>
    <Container>
      
      <Box sx={{textAlign: 'center', my: 4}}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/generate">
          Get Started
        </Button>
        <Button variant="outlined" color="primary" sx={{mt: 2}}>
          Learn More
        </Button>
      </Box>
        <Box sx={{my: 6}}>
            <Typography variant="h4" component="h2" gutterBottom>Features</Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">Easy Text Input</Typography>
                    <Typography>Simply input your text and let our software do the rest. Creating Flashcards has never been easier. </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">Smart flashcard</Typography>
                    <Typography>Our AI Intelligently breaks down your text into concise flashcards, perfect for studying. </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">Accessible Anywhere</Typography>
                    <Typography>Access your flashcards from any device, at any time. Study on the go with ease.</Typography>
                </Grid>
            </Grid>
        </Box>
        
        {/* Pricing section */}
        <Box sx={{my: 6, textAlign: 'center'}}>
            <Typography variant="h4" component="h2" gutterBottom>Pricing</Typography>
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={4}>
                    <Box 
                        sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 2,
                            height: '100%',
                        }}
                    >
                        <Typography variant="h5">Basic</Typography>
                        <Typography variant="h6">$5 / Month</Typography>
                        <Typography>Access to basic flashcard features and limited storage. </Typography>
                        <Button variant="contained" color="primary" sx={{mt: 2}}>Choose Basic</Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 2,
                            height: '100%',
                        }}
                    >
                        <Typography variant="h5">Pro</Typography>
                        <Typography variant="h6">$10 / Month</Typography>
                        <Typography>Advanced features including AI-powered flashcard creation and unlimited storage.</Typography>
                        <Button variant="contained" color="primary" sx={{mt: 2}}>Choose Pro</Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 2,
                            height: '100%',
                        }}
                    >
                        <Typography variant="h5">Enterprise</Typography>
                        <Typography variant="h6">Contact Us</Typography>
                        <Typography>Custom solutions for large organizations and educational institutions.</Typography>
                        <Button variant="contained" color="primary" sx={{mt: 2}}>Contact Sales</Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Container>
    </main>
  );
}