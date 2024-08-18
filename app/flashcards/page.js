'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  Button,
  Link,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { styled } from '@mui/system'

const FlashcardContainer = styled(Card)(({ theme }) => ({
  perspective: '1000px',
  height: '200px',
  cursor: 'pointer',
}))

const FlashcardInner = styled('div')(({ flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
}))

const FlashcardFace = styled(CardContent)(({ back }) => ({
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

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcards, setFlashcards] = useState([])
  const [cardSets, setCardSets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [flipped, setFlipped] = useState({})
  const searchParams = useSearchParams()
  const search = searchParams.get('id')

  useEffect(() => {
    async function getFlashcards() {
      if (!isLoaded || !isSignedIn || !user || !search) return

      try {
        const userDocRef = doc(db, 'users', user.id)
        const setDocRef = doc(collection(userDocRef, 'flashcardSets'), search)
        const setDocSnap = await getDoc(setDocRef)

        if (setDocSnap.exists()) {
          const data = setDocSnap.data()
          console.log('Flashcard set data:', data)
          setFlashcards(data.flashcards || [])
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error getting flashcards:', error)
      }
    }

    async function getCardSets() {
      if (!isLoaded || !isSignedIn || !user) return

      try {
        const userDocRef = doc(db, 'users', user.id)
        const setsCollectionRef = collection(userDocRef, 'flashcardSets')
        const setsSnapshot = await getDocs(setsCollectionRef)
        const sets = setsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('All card sets:', sets)
        setCardSets(sets)
      } catch (error) {
        console.error('Error getting card sets:', error)
      }
    }

    getFlashcards()
    getCardSets()
  }, [isLoaded, isSignedIn, user, search])

  const handleCardClick = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const filteredCardSets = cardSets.filter(set => 
    set.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>
  }

  const currentSet = cardSets.find(set => set.id === search)
  console.log('Current set:', currentSet)

  return (
    <main>
      <AppBar position="static" sx={{backgroundColor: '#3f51b5'}}>
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Flashcard Sets
        </Typography>
        <TextField
          fullWidth
          label="Search sets"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List>
          {filteredCardSets.map((set) => (
            <ListItem key={set.id} button component="a" href={`/flashcards?id=${set.id}`}>
              <ListItemText primary={set.id} />
            </ListItem>
          ))}
        </List>
      </Box>

      {search && (
        <>
          <Typography variant="h4" component="h2" gutterBottom>
            Flashcards: {search}
          </Typography>
          <Grid container spacing={3}>
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
        </>
      )}
    </Container>
    </main>
  )
}