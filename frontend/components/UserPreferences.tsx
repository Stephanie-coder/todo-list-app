import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { UserPreferences as UserPreferencesType, UpdatePreferencesRequest } from "~backend/user/types";

interface UserPreferencesProps {
  open: boolean;
  onClose: () => void;
}

export default function UserPreferences({ open, onClose }: UserPreferencesProps) {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState<Partial<UpdatePreferencesRequest>>({});

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      return await backend.user.getPreferences();
    },
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePreferencesRequest) => {
      return await backend.user.updatePreferences(data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        reminderTime: preferences.reminderTime,
        timezone: preferences.timezone,
      });
    }
  }, [preferences]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Shanghai", label: "Shanghai" },
    { value: "Australia/Sydney", label: "Sydney" },
  ];

  const reminderHours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: `${i.toString().padStart(2, '0')}:00`,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Preferences
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email notifications
                </Label>
                <Switch
                  id="email-notifications"
                  checked={formData.emailNotifications ?? false}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={formData.pushNotifications ?? false}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Reminders</h3>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="text-sm">
                  Daily reminder time
                </Label>
                <Select
                  value={formData.reminderTime?.toString() ?? "9"}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, reminderTime: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderHours.map((hour) => (
                      <SelectItem key={hour.value} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm">
                  Timezone
                </Label>
                <Select
                  value={formData.timezone ?? "UTC"}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
