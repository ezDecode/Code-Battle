// Simple in-memory database for demo purposes
// This will be replaced with actual MongoDB when properly configured

class MockDB {
  constructor() {
    this.users = new Map()
    this.teams = new Map()
    this.challenges = new Map()
    this.nextId = 1
  }

  generateId() {
    return (this.nextId++).toString()
  }

  // User operations
  createUser(userData) {
    const id = this.generateId()
    const user = {
      _id: id,
      ...userData,
      totalScore: 0,
      streak: 0,
      skillLevel: 'beginner',
      teamId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.users.set(id, user)
    return user
  }

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  findUserByLeetcodeUsername(username) {
    for (const user of this.users.values()) {
      if (user.leetcodeUsername === username) {
        return user
      }
    }
    return null
  }

  findUserById(id) {
    return this.users.get(id) || null
  }

  updateUser(id, updates) {
    const user = this.users.get(id)
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() })
      this.users.set(id, user)
      return user
    }
    return null
  }

  // Team operations
  createTeam(teamData) {
    const id = this.generateId()
    const team = {
      _id: id,
      ...teamData,
      members: teamData.members || [],
      totalScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.teams.set(id, team)
    return team
  }

  findTeamById(id) {
    return this.teams.get(id) || null
  }

  getAllTeams() {
    return Array.from(this.teams.values())
  }

  updateTeam(id, updates) {
    const team = this.teams.get(id)
    if (team) {
      Object.assign(team, updates, { updatedAt: new Date() })
      this.teams.set(id, team)
      return team
    }
    return null
  }

  deleteTeam(id) {
    return this.teams.delete(id)
  }

  // Challenge operations
  createChallenge(challengeData) {
    const id = this.generateId()
    const challenge = {
      _id: id,
      ...challengeData,
      isCompleted: false,
      points: 0,
      bonusPoints: 0,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.challenges.set(id, challenge)
    return challenge
  }

  findChallengeById(id) {
    return this.challenges.get(id) || null
  }

  findChallengesByUserId(userId) {
    return Array.from(this.challenges.values()).filter(
      challenge => challenge.userId === userId
    )
  }

  updateChallenge(id, updates) {
    const challenge = this.challenges.get(id)
    if (challenge) {
      Object.assign(challenge, updates, { updatedAt: new Date() })
      this.challenges.set(id, challenge)
      return challenge
    }
    return null
  }

  // Utility methods
  getAllUsers() {
    return Array.from(this.users.values())
  }

  getUserLeaderboard() {
    return this.getAllUsers()
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50)
  }

  getTeamLeaderboard() {
    return this.getAllTeams()
      .map(team => {
        const teamScore = team.members.reduce((sum, memberId) => {
          const member = this.findUserById(memberId)
          return sum + (member ? member.totalScore : 0)
        }, 0)
        return { ...team, totalScore: teamScore }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50)
  }

  // Reset database (for testing)
  reset() {
    this.users.clear()
    this.teams.clear()
    this.challenges.clear()
    this.nextId = 1
  }
}

// Export singleton instance
const mockDB = new MockDB()

// Add some demo data
const demoUser = mockDB.createUser({
  displayName: 'Demo User',
  leetcodeUsername: 'demo_user',
  email: 'demo@codebattle.com',
  password: '$2a$10$demo.hashed.password.here' // This would be properly hashed
})

console.log('📝 Mock database initialized with demo data')
console.log('🔑 Demo login: demo@codebattle.com / password: demo')

module.exports = mockDB
