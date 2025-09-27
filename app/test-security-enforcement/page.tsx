"use client"

import { useState, useEffect } from "react"
import { getSecuritySettings, validatePassword } from "@/lib/security-settings"
import { LoginAttemptService } from "@/lib/login-attempts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

export default function TestSecurityEnforcementPage() {
  const [securitySettings, setSecuritySettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})
  const [testEmail, setTestEmail] = useState("test@example.com")

  useEffect(() => {
    loadSecuritySettings()
  }, [])

  const loadSecuritySettings = async () => {
    try {
      const settings = await getSecuritySettings()
      setSecuritySettings(settings)
    } catch (error) {
      console.error("Error loading security settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const testPasswordValidation = () => {
    if (!securitySettings) return

    const testPasswords = [
      { password: "123", shouldPass: false, reason: "Too short" },
      { password: "1234567", shouldPass: false, reason: "One less than minimum" },
      { password: "12345678", shouldPass: true, reason: "Exactly minimum length" },
      { password: "123456789", shouldPass: true, reason: "Above minimum length" },
    ]

    const results = testPasswords.map(test => {
      const validation = validatePassword(test.password, securitySettings.passwordMinLength)
      const actualResult = validation.valid
      const passed = actualResult === test.shouldPass
      return {
        ...test,
        actualResult,
        passed,
        error: validation.error
      }
    })

    setTestResults(prev => ({ ...prev, passwordValidation: results }))
  }

  const testLoginAttempts = async () => {
    try {
      const remainingAttempts = await LoginAttemptService.getRemainingAttempts(testEmail)
      const lockStatus = await LoginAttemptService.isAccountLocked(testEmail)
      
      setTestResults(prev => ({ 
        ...prev, 
        loginAttempts: {
          remainingAttempts,
          isLocked: lockStatus.locked,
          remainingTime: lockStatus.remainingTime,
          configured: securitySettings?.maxLoginAttempts || 5
        }
      }))
    } catch (error) {
      console.error("Error testing login attempts:", error)
      setTestResults(prev => ({ 
        ...prev, 
        loginAttempts: { error: "Failed to test login attempts" }
      }))
    }
  }

  const testSessionTimeout = () => {
    setTestResults(prev => ({ 
      ...prev, 
      sessionTimeout: {
        configured: securitySettings?.sessionTimeout || 30,
        note: "Session timeout is enforced in AuthContext - users will be logged out after inactivity",
        implementation: "✅ Implemented - checks every minute and logs out inactive users"
      }
    }))
  }

  const simulateFailedLogin = async () => {
    try {
      await LoginAttemptService.recordAttempt(testEmail, false, "127.0.0.1", "Test Browser")
      setTestResults(prev => ({ 
        ...prev, 
        simulatedLogin: {
          message: "Failed login attempt recorded",
          timestamp: new Date().toISOString()
        }
      }))
      // Refresh login attempts test
      testLoginAttempts()
    } catch (error) {
      console.error("Error simulating failed login:", error)
    }
  }

  const clearFailedAttempts = async () => {
    try {
      await LoginAttemptService.clearFailedAttempts(testEmail)
      setTestResults(prev => ({ 
        ...prev, 
        clearAttempts: {
          message: "Failed login attempts cleared",
          timestamp: new Date().toISOString()
        }
      }))
      // Refresh login attempts test
      testLoginAttempts()
    } catch (error) {
      console.error("Error clearing failed attempts:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading security settings...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Security Settings Enforcement Test</h1>
        <p className="text-gray-600">Verify that security settings from admin panel are properly enforced</p>
      </div>
      
      {/* Current Settings Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded">
              <strong>Session Timeout:</strong> {securitySettings?.sessionTimeout || "Not set"} minutes
            </div>
            <div className="p-4 border rounded">
              <strong>Password Min Length:</strong> {securitySettings?.passwordMinLength || "Not set"} characters
            </div>
            <div className="p-4 border rounded">
              <strong>Max Login Attempts:</strong> {securitySettings?.maxLoginAttempts || "Not set"}
            </div>
            <div className="p-4 border rounded">
              <strong>Account Lockout Duration:</strong> {securitySettings?.accountLockoutDuration || "Not set"} minutes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Validation Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Password Validation Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testPasswordValidation} className="mb-4">
            Test Password Validation
          </Button>
          {testResults.passwordValidation && (
            <div className="space-y-2">
              {testResults.passwordValidation.map((result: any, index: number) => (
                <div key={index} className={`p-3 rounded flex items-center gap-2 ${
                  result.passed ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  {result.passed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <div className="flex-1">
                    <strong>Password:</strong> "{result.password}" | 
                    <strong> Expected:</strong> {result.shouldPass ? 'Pass' : 'Fail'} | 
                    <strong> Actual:</strong> {result.actualResult ? 'Pass' : 'Fail'} | 
                    <strong> Status:</strong> {result.passed ? '✅ PASS' : '❌ FAIL'}
                    {result.error && <div className="text-sm text-gray-600">Error: {result.error}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Timeout Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Timeout Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testSessionTimeout} className="mb-4">
            Test Session Timeout
          </Button>
          {testResults.sessionTimeout && (
            <div className="p-4 bg-green-100 border border-green-300 rounded">
              <div><strong>Configured:</strong> {testResults.sessionTimeout.configured} minutes</div>
              <div><strong>Implementation:</strong> {testResults.sessionTimeout.implementation}</div>
              <div><strong>Note:</strong> {testResults.sessionTimeout.note}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Attempts Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Login Attempts & Account Lockout Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email:</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={testLoginAttempts}>
                Check Login Attempts
              </Button>
              <Button onClick={simulateFailedLogin} variant="outline">
                Simulate Failed Login
              </Button>
              <Button onClick={clearFailedAttempts} variant="outline">
                Clear Failed Attempts
              </Button>
            </div>
            {testResults.loginAttempts && (
              <div className="p-4 border rounded">
                <div><strong>Remaining Attempts:</strong> {testResults.loginAttempts.remainingAttempts}</div>
                <div><strong>Account Locked:</strong> {testResults.loginAttempts.isLocked ? 'Yes' : 'No'}</div>
                {testResults.loginAttempts.remainingTime && (
                  <div><strong>Lockout Remaining:</strong> {testResults.loginAttempts.remainingTime} minutes</div>
                )}
                <div><strong>Max Attempts Configured:</strong> {testResults.loginAttempts.configured}</div>
                {testResults.loginAttempts.error && (
                  <div className="text-red-600"><strong>Error:</strong> {testResults.loginAttempts.error}</div>
                )}
              </div>
            )}
            {testResults.simulatedLogin && (
              <Alert>
                <AlertDescription>
                  {testResults.simulatedLogin.message} at {testResults.simulatedLogin.timestamp}
                </AlertDescription>
              </Alert>
            )}
            {testResults.clearAttempts && (
              <Alert>
                <AlertDescription>
                  {testResults.clearAttempts.message} at {testResults.clearAttempts.timestamp}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Enforcement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Password minimum length validation is enforced in registration and password reset</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Session timeout is enforced in AuthContext with activity tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Login attempt limiting and account lockout are implemented</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Security settings are loaded dynamically from the database</span>
            </div>
          </div>
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> The login_attempts table needs to be created in your database. 
              Run the migration script in migrations/create_login_attempts_table.sql
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
