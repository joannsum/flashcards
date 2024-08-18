'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcards, setFlashcards] = useState([])
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
          setFlashcards(setDocSnap.data().flashcards || [])
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error getting flashcards:', error)
      }
    }

    getFlashcards()
  }, [isLoaded, isSignedIn, user, search])

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Flashcards: {search}
      </Typography>
      <Grid container spacing={3}>
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea>
                <CardContent>
                  <Typography variant="h6">Front:</Typography>
                  <Typography>{flashcard.front}</Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography>
                  <Typography>{flashcard.back}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}