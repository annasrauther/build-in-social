export default function VoiceSettings() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="voice-settings">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="voice-settings"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Voice settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Configure the voice used for your video narration.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">
              Voice selection and preview will be available here. You can choose
              from a library of AI voices or upload your own voice sample for
              cloning.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
