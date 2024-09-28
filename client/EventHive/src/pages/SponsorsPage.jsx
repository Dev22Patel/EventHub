'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, MessageSquare, Send, X, Search } from 'lucide-react'

const sponsors = [
  { id: 1, name: 'TechCorp', description: 'Leading technology solutions provider', logo: '/placeholder.svg?height=100&width=100' },
  { id: 2, name: 'EcoGreen', description: 'Sustainable energy innovator', logo: '/placeholder.svg?height=100&width=100' },
  { id: 3, name: 'HealthPlus', description: 'Advanced healthcare systems', logo: '/placeholder.svg?height=100&width=100' },
  { id: 4, name: 'FinTech Solutions', description: 'Innovative financial technology', logo: '/placeholder.svg?height=100&width=100' },
  { id: 5, name: 'EduLearn', description: 'Cutting-edge educational platforms', logo: '/placeholder.svg?height=100&width=100' },
  { id: 6, name: 'AeroSpace', description: 'Next-generation aerospace technology', logo: '/placeholder.svg?height=100&width=100' },
]

export default function EnhancedSponsorsPage() {
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [message, setMessage] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSponsors, setFilteredSponsors] = useState(sponsors)

  const handleSponsorClick = (sponsor) => {
    setSelectedSponsor(sponsor)
    setIsDialogOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedSponsor(null)
    setIsDialogOpen(false)
    setMessage('')
  }

  const handleMessageChange = (event) => {
    setMessage(event.target.value)
  }

  const handleSendMessage = () => {
    // Here you would typically send the message to your backend
    console.log(`Message sent to ${selectedSponsor.name}: ${message}`)
    setMessage('')
    handleCloseDetails()
    setToast({
      title: "Message Sent",
      description: `Your message has been sent to ${selectedSponsor.name}.`,
    })
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    const filtered = sponsors.filter(sponsor =>
      sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSponsors(filtered)
  }, [searchTerm])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Valued Sponsors</h1>

      {/* Search input */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search sponsors..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="absolute left-3 top-3 text-gray-400" />
      </div>

      {filteredSponsors.length === 0 ? (
        <p className="text-center text-gray-500">No sponsors found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-md h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-semibold text-center mb-2">{sponsor.name}</h2>
                </div>
                <div className="px-6 pb-6 flex justify-center">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => handleSponsorClick(sponsor)}
                  >
                    <Info className="mr-2 h-4 w-4" /> Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{selectedSponsor.name}</h3>
                <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{selectedSponsor.description}</p>
              <div className="flex items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <img src={selectedSponsor.logo} alt={`${selectedSponsor.name} logo`} className="w-full h-full object-cover" />
                </div>
              </div>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4"
                placeholder="Type your message here..."
                value={message}
                onChange={handleMessageChange}
              ></textarea>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSendMessage}
              >
                <Send className="mr-2 h-4 w-4" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg"
          >
            <h4 className="font-bold">{toast.title}</h4>
            <p>{toast.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
