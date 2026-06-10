import { type Category, row, subcategory, toggle } from '../category';

export const privacy: Category = {
  id: 'privacy',
  label: 'Privacy & Security',
  icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',

  render: () => `
    <h1>Privacy &amp; Security</h1>
    <p class="category-sub">Protections enabled by default.</p>

    ${subcategory('Built-in protections',
      row({
        label: 'Ad blocker',
        hint: 'Blocks ads, trackers, and known malicious domains',
        control: '<span class="pill">●  Enabled</span>',
      }) +
      row({
        label: 'Fingerprint guard',
        hint: 'Canvas noise · WebGL spoofing · Referrer trimming',
        control: '<span class="pill">●  Active</span>',
      })
    )}

    ${subcategory('Tracking',
      row({
        label: 'Do Not Track',
        hint: 'Send a DNT:1 header with every request',
        control: toggle('dnt'),
      })
    )}

    ${subcategory('Data',
      row({
        label: 'Clear browsing data on quit',
        hint: 'Cookies, cache, and site storage are wiped when Draco closes',
        control: toggle('clearOnQuit'),
      })
    )}
  `,
};
