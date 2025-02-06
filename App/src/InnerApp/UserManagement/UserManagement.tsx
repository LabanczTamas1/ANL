import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  company: string
  step: number
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No token found')
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/allUsersProgress`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        console.log('Fetched Users:', data.allUserData)
        setUsers(data.allUserData) // Ensure your backend returns an array of users
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const updateStep = (userId: string, step: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, step } : user
      )
    )
  }

  useEffect(() => {
    const userToUpdate = users.find((user) => user.step !== 0) // Optional: Add conditions to detect actual updates
    const token = localStorage.getItem("authToken");
  
    if (userToUpdate && token) {
      const updateUserStep = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/changeUserProgress/${userToUpdate.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ progressStep: userToUpdate.step }),
          })
  
          if (!response.ok) {
            throw new Error('Failed to update step')
          }
  
          const data = await response.json()
          console.log('API Response:', data)
        } catch (error) {
          console.error('Error updating step:', error)
        }
      }
  
      updateUserStep()
    }
  }, [users])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Company</th>
              <th className="text-left p-4">Progress (Steps)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.company}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <div
                        key={step}
                        className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${
                          user.step >= step
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                        onClick={() => updateStep(user.id, step)}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
