import { memo } from 'react';
import { MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { NewsRibbon } from './NewsRibbon';
import { QuickLinksColumn } from './QuickLinksColumn';
import { useSiteContentMap } from '@/hooks/useSiteContent';

export const ProfileSection = memo(function ProfileSection() {
  const { contentMap, isLoading } = useSiteContentMap('profile');

  const name = contentMap['profile_name'] || 'Jerin M R';
  const role = contentMap['profile_role'] || 'L1 IT Professional';
  const focus = contentMap['profile_focus'] || 'Networking & Server Administration';
  const location = contentMap['profile_location'] || 'Thrissur, Kerala';
  const email = contentMap['profile_email'] || 'jerinmr@hotmail.com';
  const phone = contentMap['profile_phone'] || '8848158987';
  const linkedin = contentMap['profile_linkedin'] || 'https://linkedin.com/in/jerinmr51';
  const bio = contentMap['profile_bio'] || '';

  const linkedinDisplay = linkedin.replace('https://', '').replace('http://', '');

  return (
    <section className="space-y-4" aria-label="Profile overview">
      <div className="border border-terminal-green p-3 sm:p-4 bg-card/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="font-mono">
                <h1 className="text-terminal-green text-lg sm:text-xl font-bold">{name}</h1>
                <p className="text-terminal-cyan text-base sm:text-lg">{role}</p>
                <p className="text-terminal-gray text-sm sm:text-base">{focus}</p>
              </div>
              
              <address className="text-xs sm:text-sm space-y-1 font-mono not-italic">
                <div className="flex items-center gap-1 sm:gap-2 text-terminal-amber">
                  <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-terminal-cyan">
                  <Mail className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="break-all hover:underline">{email}</a>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-terminal-blue">
                  <Phone className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:+91${phone}`} className="hover:underline">{phone}</a>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-terminal-magenta">
                  <Linkedin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="break-all hover:underline">{linkedinDisplay}</a>
                </div>
              </address>
            </div>
          
            <div className="mt-4 pt-4 border-t border-terminal-gray/30">
              <p className="text-xs sm:text-sm text-foreground font-mono leading-relaxed">
                {bio}
              </p>
            </div>
          </div>

          <div className="lg:w-48 lg:border-l lg:border-terminal-gray/30 lg:pl-4">
            <QuickLinksColumn />
          </div>
        </div>
        
        <NewsRibbon />
      </div>
    </section>
  );
});
