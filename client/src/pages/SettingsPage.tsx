import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
        <div className="space-y-4 max-w-2xl">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              defaultValue="John Doe"
              className="mt-2"
              data-testid="input-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              defaultValue="john@example.com"
              className="mt-2"
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="wallet">USDC Wallet Address</Label>
            <Input
              id="wallet"
              type="text"
              defaultValue="0x1234...5678"
              className="mt-2"
              data-testid="input-wallet"
              readOnly
            />
          </div>
          <Button data-testid="button-save-profile">Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Preferences</h2>
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive alerts for transactions and insights
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-insights">AI Insights</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Get personalized spending recommendations
              </p>
            </div>
            <Switch
              id="ai-insights"
              checked={aiInsights}
              onCheckedChange={setAiInsights}
              data-testid="switch-ai-insights"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa"
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              data-testid="switch-2fa"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Security</h2>
        <div className="space-y-4 max-w-2xl">
          <Button variant="outline" data-testid="button-change-password">
            Change Password
          </Button>
          <Button variant="outline" data-testid="button-setup-pin">
            Setup Circle PIN
          </Button>
          <Button variant="destructive" data-testid="button-delete-account">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
