import { ScrollArea } from '../ui/scroll-area';
import BackButton from '../ui/BackButton';
import type { View, ViewOptions } from '../../App';
import ExtensionsSection from './extensions/ExtensionsSection';
import ModelsSection from './models/ModelsSection';
import { ModeSection } from './mode/ModeSection';
import SessionSharingSection from './sessions/SessionSharingSection';
import { ExtensionConfig } from '../../api';

export type SettingsViewOptions = {
  deepLinkConfig?: ExtensionConfig;
  showEnvVars?: boolean;
};

export default function SettingsView({
  onClose,
  setView,
  viewOptions,
}: {
  onClose: () => void;
  setView: (view: View, viewOptions?: ViewOptions) => void;
  viewOptions: SettingsViewOptions;
}) {
  return (
    <div className="h-screen w-full animate-[fadein_200ms_ease-in_forwards]">
      <div className="relative flex items-center h-[36px] w-full bg-bgSubtle"></div>

      <ScrollArea className="h-full w-full">
        <div className="flex flex-col pb-24">
          <div className="px-8 pt-6 pb-4">
            <BackButton onClick={() => onClose()} />
            <h1 className="text-3xl font-medium text-textStandard mt-1">Settings</h1>
          </div>

          {/* Content Area */}
          <div className="flex-1 pt-[20px]">
            <div className="space-y-8">
              {/* Models Section */}
              <ModelsSection setView={setView} />
              {/* Extensions Section */}
              <ExtensionsSection
                deepLinkConfig={viewOptions.deepLinkConfig}
                showEnvVars={viewOptions.showEnvVars}
              />
              {/* Goose Modes */}
              <ModeSection setView={setView} />
              {/*Session sharing*/}
              <SessionSharingSection />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
