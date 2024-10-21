'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, Search, Mail, Tag } from 'lucide-react'

const sponsors = [
  { id: 1, name: 'TechCorp', description: 'Leading technology solutions provider', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUTHAz2ss7DkM30-1UvfvZTbYhBQIAOLoMw&s?height=100&width=100', email: 'contact@techcorp.com', type: 'Technology' },
  { id: 2, name: 'EcoGreen', description: 'Sustainable energy innovator', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSSudyQYExXpcQT-Su_H8MyHBwvloNu0iP0g&s?height=100&width=100', email: 'info@ecogreen.com', type: 'Energy' },
  { id: 3, name: 'HealthPlus', description: 'Advanced healthcare systems', logo: 'https://img.freepik.com/premium-vector/medical-health-plus-cross-logo-design_375081-810.jpg?height=100&width=100', email: 'support@healthplus.com', type: 'Healthcare' },
  { id: 4, name: 'FinTech Solutions', description: 'Innovative financial technology', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrpYbBLNxB7kVKd4TXMsVGROJSXKYi4ScBFg&s?height=100&width=100', email: 'hello@fintechsolutions.com', type: 'Finance' },
  { id: 5, name: 'EduLearn', description: 'Cutting-edge educational platforms', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvdWr2vUxgRJE2x6oyty7NOX1_jPW7LvXHRw&s?height=100&width=100', email: 'info@edulearn.com', type: 'Education' },
  { id: 6, name: 'AeroSpace', description: 'Next-generation aerospace technology', logo: 'https://www.shutterstock.com/image-vector/abstract-initial-letter-aerospace-logo-600nw-2418709995.jpg?height=100&width=100', email: 'contact@aerospace.com', type: 'Aerospace' },
]

export default function EnhancedSponsorsPage() {
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSponsors, setFilteredSponsors] = useState(sponsors)

  const handleSponsorClick = (sponsor) => {
    setSelectedSponsor(sponsor)
    setIsDialogOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedSponsor(null)
    setIsDialogOpen(false)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  useEffect(() => {
    const filtered = sponsors.filter(sponsor =>
      sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSponsors(filtered)
  }, [searchTerm])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Valued Sponsors</h1>

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
                  <p className="text-sm text-gray-500 text-center">{sponsor.type}</p>
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
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-600">{selectedSponsor.email}</p>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-600">{selectedSponsor.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
