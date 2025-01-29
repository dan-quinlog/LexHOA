import { useApolloClient, gql } from '@apollo/client'
import { useState } from 'react'
import { DELETE_PERSON, DELETE_PROPERTY, DELETE_PAYMENT } from '../../queries/mutations'
import { CREATE_PERSON, CREATE_PROPERTY, CREATE_PAYMENT } from '../../queries/mutations'
import { testData } from './seedData'

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

export const ResetButton = () => {
  const client = useApolloClient()
  const [isResetting, setIsResetting] = useState(false)
  const [status, setStatus] = useState('')

  const resetDatabase = async () => {
    setIsResetting(true)
    setStatus('Starting database reset...')
   
    try {
      // Clear existing data
      setStatus('Fetching records...')
      const { data: peopleData } = await client.query({ query: LIST_IDS.PEOPLE })
      const { data: propertiesData } = await client.query({ query: LIST_IDS.PROPERTIES })
      const { data: paymentsData } = await client.query({ query: LIST_IDS.PAYMENTS })

      setStatus('Deleting records...')
      const deletePromises = [
        ...paymentsData.listPayments.items.map(item =>
          client.mutate({ mutation: DELETE_PAYMENT, variables: { input: { id: item.id } } })
        ),
        ...propertiesData.listProperties.items.map(item =>
          client.mutate({ mutation: DELETE_PROPERTY, variables: { input: { id: item.id } } })
        ),
        ...peopleData.listPeople.items.map(item =>
          client.mutate({ mutation: DELETE_PERSON, variables: { input: { id: item.id } } })
        )
      ]

      await Promise.all(deletePromises)
      
      // Seed new data
      setStatus('Seeding new data...')
      const { profiles, properties, payments } = testData

      for (const profile of profiles) {
        await client.mutate({ mutation: CREATE_PERSON, variables: { input: profile } })
      }
      for (const property of properties) {
        await client.mutate({ mutation: CREATE_PROPERTY, variables: { input: property } })
      }
      for (const payment of payments) {
        await client.mutate({ mutation: CREATE_PAYMENT, variables: { input: payment } })
      }

      setStatus('Database reset successfully!')
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsResetting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button
        onClick={resetDatabase}
        disabled={isResetting}
        style={{
          backgroundColor: isResetting ? 'grey' : 'orange',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: isResetting ? 'not-allowed' : 'pointer'
        }}
      >
        {isResetting ? 'Resetting...' : 'Reset DB'}
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
