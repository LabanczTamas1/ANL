import React from "react";
import { Avatar, Heading, Text } from "@design-system/components";

export interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  subtitle: string;
}

/**
 * Organism: avatar + name header for the account page.
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ firstName, lastName, subtitle }) => (
  <div className="flex items-center gap-5 border-b border-line dark:border-line-dark pb-6">
    <Avatar name={`${firstName} ${lastName}`} size="xl" />
    <div className="min-w-0">
      <Heading level={1} className="truncate">
        {`${firstName} ${lastName}`.trim() || subtitle}
      </Heading>
      <Text tone="subtle" size="lg" className="mt-1">
        {subtitle}
      </Text>
    </div>
  </div>
);

export default ProfileHeader;
