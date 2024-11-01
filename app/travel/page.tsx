'use client'

import { useState } from 'react'
interface Message {
  role: 'user' | 'assistant'
  content: string
}

function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: 'you are a travel guru and i want you to make me a plan for the city or country that i will tell you ,' + input }
    console.log(userMessage);
    const userMessageSplit = userMessage.content.split(',');
    const userMessageFinal: Message = { role: 'user', content: userMessageSplit[1] }
    setMessages(prev => [...prev, userMessageFinal])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const data: { message: string } = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }])
    } 
  }

  return { messages, input, setInput, handleSubmit }
}

export default function ChatBot() {
  const { messages, input, setInput, handleSubmit } = useChat()

  return (
    <section style={{height: '100vh' , display:'flex', alignItems:'center', textAlign: 'center', padding: '2rem' , backgroundColor: '#102820'}}>
<div className="card">
        <div className="tools">
            <div className="circle">
            <span className="red box"></span>
            </div>
            <div className="circle">
            <span className="yellow box"></span>
            </div>
            <div className="circle">
            <span className="green box"></span>
            </div>
        </div>

        <div style={{height: '95%' ,display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div className="card__content">
            
            <h1 style={{marginBottom: '15px', color:'#235347'}}>The Travel Buddy you always wanted</h1>

            <div style={{}}>
                <div id='box' className='box-messages'>
                    
            {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${
                      message.role === 'assistant' ? 'assistantMessage' : 'userMessage'
                    }`}
                  >
                    <strong>{message.role === 'assistant' ? 'Travel Assistant: ' : 'You: '}</strong>
                    
                    {message.content}
                  </div>
                ))}
                </div>
                
                
                <div>
                  <form onSubmit={handleSubmit} style={{display:'flex', alignItems: 'center', flexDirection:'row' , justifyContent:'center' , paddingTop:'0.3rem'}}>

                  <div className="textInputWrapper">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="textInput"
                    />
                  </div>


                  <button className="button"  type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
                </svg>
                <div className="text">
                Send
                </div>
                </button>
                  </form>
                </div> 
            </div>
          </div>
        </div>
        </div>





       
        </section>
    )
}