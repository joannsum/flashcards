'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Card,
  AppBar,
  Toolbar,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { db } from '../../firebase.js'
import { doc, collection, getDoc, setDoc } from 'firebase/firestore'
import { styled } from '@mui/system'

// Styled components for the flashcard
const FlashcardContainer = styled(Card)(({ theme }) => ({
  perspective: '1000px',
  height: '200px', // Set a fixed height for the card
  cursor: 'pointer',
}))

const FlashcardInner = styled('div')(({ theme, flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
}))

const FlashcardFace = styled(CardContent)(({ theme, back }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
}))

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcards, setFlashCards] = useState([])
  const [flipped, setFlipped] = useState({})
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleOpenDialog = () => setDialogOpen(true)
  const handleCloseDialog = () => setDialogOpen(false)

  const saveFlashcards = async () => {
    console.log('saveFlashcards function called');
    console.log('isLoaded:', isLoaded);
    console.log('isSignedIn:', isSignedIn);
    console.log('user:', user);
  
    if (!isLoaded) {
      console.log('Clerk is still loading');
      return;
    }
  
    if (!isSignedIn || !user) {
      console.error('User not signed in');
      alert('Please sign in to save flashcards.');
      return;
    }
  
    console.log('User ID:', user.id);
  
    if (!name.trim()) {
      console.error('Set name is empty');
      alert('Please enter a name for your flashcard set.');
      return;
    }
  
    setIsSaving(true);
    try {
      console.log('Starting to save flashcards');
      console.log('Set name:', name);
      console.log('Number of flashcards:', flashcards.length);
  
      const userDocRef = doc(db, 'users', user.id);
      console.log('User document reference created:', userDocRef.path);
  
      const userDocSnap = await getDoc(userDocRef);
      console.log('User document snapshot retrieved, exists:', userDocSnap.exists());
  
      if (userDocSnap.exists()) {
        console.log('Updating existing user document');
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcardSets || []), { name: name }];
        await setDoc(userDocRef, { flashcardSets: updatedSets }, { merge: true });
        console.log('User document updated successfully');
      } else {
        console.log('Creating new user document');
        await setDoc(userDocRef, { flashcardSets: [{ name: name }] });
        console.log('New user document created successfully');
      }
  
      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), name);
      console.log('Flashcard set document reference created:', setDocRef.path);
      
      console.log('Saving flashcards');
      await setDoc(setDocRef, { flashcards });
      console.log('Flashcards saved successfully');
  
      alert('Flashcards saved successfully!');
      setIsSaving(false);
      setDialogOpen(false);
      router.push(`/flashcards?id=${encodeURIComponent(name)}`);
      setName('');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error('Error occurred at:', new Date().toISOString());
      console.error('User ID when error occurred:', user.id);
      alert(`An error occurred while saving flashcards: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }
  
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }
  
      const data = await response.json()
      setFlashCards(data)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    }
  }

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <main>
      <AppBar position="static">
        <Toolbar >
          <Typography variant="h6" style={{flexGrow: 1}}>
            <a href="localhost:3000">Flashcard SaaS</a>
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
    <Container maxWidth="md">
      
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Flashcards
        </Typography>
        <TextField 
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Enter text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Generate Flashcards
        </Button>
      </Box>
      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Generated Flashcards
          </Typography>
          <Grid container spacing={2}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FlashcardContainer onClick={() => handleCardClick(index)}>
                  <FlashcardInner flipped={flipped[index]}>
                    <FlashcardFace>
                      <Typography variant="h6">Front:</Typography>
                      <Typography>{flashcard.front}</Typography>
                    </FlashcardFace>
                    <FlashcardFace back>
                      <Typography variant="h6">Back:</Typography>
                      <Typography>{flashcard.back}</Typography>
                    </FlashcardFace>
                  </FlashcardInner>
                </FlashcardContainer>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {flashcards.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Save Flashcards
          </Button>
        </Box>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={saveFlashcards} color="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </main>
  )
}