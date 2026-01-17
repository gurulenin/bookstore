import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SocialLinks {
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  github_url: string | null;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook_url: null,
    twitter_url: null,
    instagram_url: null,
    linkedin_url: null,
    youtube_url: null,
    github_url: null,
  });

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('facebook_url, twitter_url, instagram_url, linkedin_url, youtube_url, github_url')
      .maybeSingle();

    if (data) {
      setSocialLinks(data);
    }
  };

  const socialMediaIcons = [
    { name: 'Facebook', url: socialLinks.facebook_url, icon: Facebook },
    { name: 'Twitter', url: socialLinks.twitter_url, icon: Twitter },
    { name: 'Instagram', url: socialLinks.instagram_url, icon: Instagram },
    { name: 'LinkedIn', url: socialLinks.linkedin_url, icon: Linkedin },
    { name: 'YouTube', url: socialLinks.youtube_url, icon: Youtube },
    { name: 'GitHub', url: socialLinks.github_url, icon: Github },
  ];

  const activeSocialMedia = socialMediaIcons.filter(item => item.url);

  return (
    <footer className="bg-slate-800 text-white py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 gap-4">
          <div className="flex items-center space-x-2 order-1 md:order-1">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-lg md:text-xl font-bold">BookHub</span>
          </div>

          {activeSocialMedia.length > 0 && (
            <div className="flex items-center space-x-3 md:space-x-4 order-2 md:order-2">
              {activeSocialMedia.map(({ name, url, icon: Icon }) => (
                <a
                  key={name}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 transition-colors"
                  aria-label={name}
                >
                  <Icon className="h-5 w-5 md:h-5 md:w-5" />
                </a>
              ))}
            </div>
          )}

          <div className="text-xs md:text-sm text-slate-300 text-center order-3 md:order-3">
            &copy; {new Date().getFullYear()} BookHub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
