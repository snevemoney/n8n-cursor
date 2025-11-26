"use client"

import { Shield, Download, Upload, Clock, Info, Database, FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

export default function BackupPage() {
  const createBackup = () => {
    // Mock backup creation
    console.log("Creating backup...")
  }
  
  // Mock backup data
  const backupHistory = [
    { 
      id: "backup_1", 
      date: "May 19, 2025",
      time: "14:30:22",
      size: "128 KB",
      type: "manual",
      status: "success"
    },
    { 
      id: "backup_2", 
      date: "May 17, 2025",
      time: "08:15:45",
      size: "127 KB",
      type: "scheduled",
      status: "success"
    },
    { 
      id: "backup_3", 
      date: "May 15, 2025",
      time: "23:05:12",
      size: "126 KB",
      type: "channel_update",
      status: "success"
    },
    { 
      id: "backup_4", 
      date: "May 13, 2025",
      time: "16:45:57",
      size: "125 KB",
      type: "scheduled",
      status: "success"
    }
  ]
  
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-900/30 p-2 rounded-full">
          <Database className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Backup Settings</h1>
          <p className="text-gray-400">Secure backups and recovery</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Backup History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-800">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Time</th>
                    <th className="pb-2 text-left font-medium">Type</th>
                    <th className="pb-2 text-left font-medium">Size</th>
                    <th className="pb-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((backup) => (
                    <tr key={backup.id} className="border-b border-gray-800 text-sm">
                      <td className="py-3">{backup.date}</td>
                      <td className="py-3">{backup.time}</td>
                      <td className="py-3 capitalize">{backup.type.replace('_', ' ')}</td>
                      <td className="py-3">{backup.size}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Backup Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              onClick={createBackup}
            >
              <Shield className="h-4 w-4" />
              Create New Backup
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Backup File
            </Button>
            
            <div className="rounded-lg bg-amber-900/30 border border-amber-800/30 p-3">
              <h4 className="text-sm font-medium text-amber-500 mb-1 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Security Reminder
              </h4>
              <p className="text-xs text-amber-300/80">
                Always store multiple copies of your backups in secure locations. Channel funds can only be recovered with proper backup files.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Backup Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Your node is configured to automatically create backups:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-200">Daily at midnight</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Edit
              </Button>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-200">After each channel update</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Shield className="h-5 w-5" />
            Important Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm mb-3">
            Always keep multiple backups of your node's static channel backup (SCB) files and seed phrases.
            Loss of these critical security items can result in permanent loss of funds.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <p className="text-gray-300">Store backups in multiple physical locations</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <p className="text-gray-300">Use encrypted storage for all backup files</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <p className="text-gray-300">Test backup restoration procedures regularly</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <p className="text-gray-300">Never share backup files or seed phrases with anyone</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 