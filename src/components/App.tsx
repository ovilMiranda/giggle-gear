import '@spectrum-web-components/theme/express/scale-medium.js'
import '@spectrum-web-components/theme/express/theme-light.js'
import addOnUISdk from 'https://new.express.adobe.com/static/add-on-sdk/sdk.js'

await addOnUISdk.ready

const { document } = addOnUISdk.app

import { Button } from '@swc-react/button'
import { Textfield } from '@swc-react/textfield'
import { Theme } from '@swc-react/theme'
import { FieldLabel } from '@swc-react/field-label'
import React, { useState } from 'react'
import './App.css'

import { AddOnSDKAPI } from 'https://new.express.adobe.com/static/add-on-sdk/sdk.js'

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  // States to store the variables
  const [inputValue, setInputValue] = useState('')
  const [inputAIValue, setAIInputValue] = useState('')
  const [meme, setMeme] = useState({
    box_count: 0,
    height: 0,
    id: '',
    name: '',
    url: '',
    width: 0,
  })
  const [memeList, setMemeList] = useState([])
  const [showMemeList, setShowMemeList] = useState(false)
  const [counter, setCounter] = useState(0)

  // Function to make an image clickable
  function ClickableImage({ imageUrl }) {
    const handleClick = () => {
      addImageFromURL(imageUrl)
    }

    return (
      <div className="item">
        <img
          src={imageUrl}
          onClick={handleClick}
          style={{
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    )
  }

  // Function to handle click
  async function handleClick() {
    const memes = await searchMemes(inputValue)
    setMemeList(memes)
    setShowMemeList(true)
  }

  // Function to handle AI click
  async function handleAIClick() {
    console.log('AI Input Value: ' + inputAIValue)
    const aiMeme = await createAiMeme(
      process.env.USERNAME,
      process.env.PASSWORD,
      inputAIValue
    )
    console.log(aiMeme)
    addImageFromURL(aiMeme.url)
  }

  // Function to handle input change
  function handleInputChange(event) {
    console.log(event.target.value)
    setInputValue(event.target.value)
  }

  // Function to handle AI input change
  function handleAIInputChange(event) {
    console.log(event.target.value)
    setAIInputValue(event.target.value)
  }

  // Function to search for memes
  async function searchMemes(query) {
    const url = 'https://api.imgflip.com/search_memes'
    const formData = new URLSearchParams({
      username: process.env.USERNAME, // Your Imgflip username with API Premium
      password: process.env.PASSWORD, // Your Imgflip password
      query: query, // The search query
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const data = await response.json()
      if (data.success) {
        return data.data.memes // Returns the array of search result memes
      } else {
        console.error('Failed to search memes:', data.error_message)
        return []
      }
    } catch (error) {
      console.error('Error searching memes:', error)
      return []
    }
  }

  // Function to create an AI meme
  async function createAiMeme(
    username,
    password,
    prefixText,
    templateId = '',
    noWatermark = true
  ) {
    const url = 'https://api.imgflip.com/ai_meme'
    const formData = new URLSearchParams({
      username: username,
      password: password,
      template_id: templateId,
      prefix_text: prefixText,
      no_watermark: noWatermark ? '1' : '0',
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        return data.data
      } else {
        console.error('Failed to generate AI meme:', data.error_message)
        return null
      }
    } catch (error) {
      console.error('Error generating AI meme:', error)
      return null
    }
  }

  // Unnecessary function, but can be used for testing purposes to get popular memes
  async function fetchPopularMemes() {
    const url = 'https://api.imgflip.com/get_memes'

    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        return data.data.memes // Returns the array of memes
      } else {
        console.error('Failed to fetch memes:', data.error_message)
        return []
      }
    } catch (error) {
      console.error('Error fetching memes:', error)
      return []
    }
  }
  async function addImageFromURL(url) {
    try {
      const blob = await fetch(url).then((response) => response.blob())
      await document.addImage(blob)
    } catch (error) {
      console.log('Failed to add the image to the page.')
    }
  }

  // Function to change the counter
  function changeCounter(operation) {
    if (operation === 'increment') {
      if (counter < memeList.length - 1) {
        setCounter(counter + 1)
      } else {
        setCounter(0)
      }
    } else {
      if (counter > 0) {
        setCounter(counter - 1)
      } else {
        setCounter(memeList.length - 1)
      }
    }
  }

  // Return the Add On
  return (
    <Theme theme="express" scale="medium" color="light">
      <h1>Meme Generator</h1>
      <div className="container">
        <FieldLabel>Seach for Existing Meme</FieldLabel>
        <Textfield value={inputValue} onInput={handleInputChange}></Textfield>
        <Button className="try" size="m" onClick={handleClick}>
          Search
        </Button>
        {showMemeList && (
          <div className="slideshow">
            <button
              className="backward-button"
              onClick={() => changeCounter('decrement')}
            ></button>
            <ClickableImage imageUrl={memeList[counter].url} />
            <button
              className="forward-button"
              onClick={() => changeCounter('increment')}
            ></button>
          </div>
        )}
      </div>

      <div className="premium">
        <FieldLabel>Create an AI Meme</FieldLabel>
        <Textfield
          value={inputAIValue}
          onInput={handleAIInputChange}
        ></Textfield>
        <Button className="try" size="m" onClick={handleAIClick}>
          Search
        </Button>
      </div>
    </Theme>
  )
}

export default App
