import { useApolloClient, gql } from '@apollo/client'
import { useState } from 'react'
import {
  DELETE_PROFILE,
      DELETE_PROPERTY,
      DELETE_PAYMENT
} from '../../queries/mutations'

// Simplified queries that only fetch IDs
const LIST_IDS = {
    PEOPLE: gql`
      query ListPeople {
        listPeople {
          items {
            id
          }
        }
      }
    `,
    PROPERTIES: gql`
      query ListProperties {
        listProperties {
          items {
            id
          }
        }
      }
    `,
    PAYMENTS: gql`
      query ListPayments {
        listPayments {
          items {
            id
          }
        }
      }
    `
}

export const ClearButton = () => {
  const client = useApolloClient()
  const [isClearing, setIsClearing] = useState(false)
  const [status, setStatus] = useState('')

  const clearDatabase = async () => {
    setIsClearing(true)
    setStatus('Starting database clear...')
    
    try {
      setStatus('Fetching records...')
      const { data: peopleData } = await client.query({ query: LIST_IDS.PEOPLE })
      const { data: propertiesData } = await client.query({ query: LIST_IDS.PROPERTIES })
      const { data: paymentsData } = await client.query({ query: LIST_IDS.PAYMENTS })

      setStatus('Deleting records...')
      const deletePromises = [
        ...peopleData.listPeople.items.map(item => 
          client.mutate({ mutation: DELETE_PROFILE, variables: { input: { id: item.id } } })
        ),
        ...propertiesData.listProperties.items.map(item =>
          client.mutate({ mutation: DELETE_PROPERTY, variables: { input: { id: item.id } } })
        ),
        ...paymentsData.listPayments.items.map(item =>
          client.mutate({ mutation: DELETE_PAYMENT, variables: { input: { id: item.id } } })
        )
      ]

      await Promise.all(deletePromises)
      setStatus('Database cleared successfully!')
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsClearing(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button 
        onClick={clearDatabase}
        disabled={isClearing}
        style={{ 
          backgroundColor: isClearing ? 'grey' : 'red', 
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: isClearing ? 'not-allowed' : 'pointer'
        }}
      >
        {isClearing ? 'Clearing...' : 'Clear DB'}
      </button>
      {status && (
        <span style={{ 
          color: status.includes('Error') ? 'red' : 'green',
          fontSize: '0.9rem'
        }}>
          {status}
        </span>
      )}
    </div>
  )
}