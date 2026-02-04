/**
 * Demo component showcasing the 5-band fairness color scale
 * This can be used as a reference for using the custom fairness colors
 */
export default function FairnessColorDemo() {
  const bands = [
    {
      name: 'Excellent',
      range: '94+',
      color: 'bg-fairness-excellent',
      textColor: 'text-white',
      description: 'Score 94 or above',
    },
    {
      name: 'Good',
      range: '88-93',
      color: 'bg-fairness-good',
      textColor: 'text-white',
      description: 'Score 88 to 93',
    },
    {
      name: 'Fair',
      range: '82-87',
      color: 'bg-fairness-fair',
      textColor: 'text-gray-900',
      description: 'Score 82 to 87',
    },
    {
      name: 'Poor',
      range: '75-81',
      color: 'bg-fairness-poor',
      textColor: 'text-white',
      description: 'Score 75 to 81',
    },
    {
      name: 'Very Poor',
      range: '<75',
      color: 'bg-fairness-very-poor',
      textColor: 'text-white',
      description: 'Score below 75',
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          5-Band Fairness Color Scale
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">
          Custom color scale for visualizing fairness scores
        </p>
      </div>
      
      <div className="grid gap-4 grid-cols-5">
        {bands.map((band) => (
          <div
            key={band.name}
            className={`${band.color} ${band.textColor} p-6 rounded-lg shadow-md transition-transform hover:scale-105`}
          >
            <div className="font-bold text-lg mb-2">{band.name}</div>
            <div className="text-sm opacity-90">{band.range}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Usage Example
        </h3>
        <code className="text-sm bg-white dark:bg-slate-800 p-4 rounded block">
          {'<div className="bg-fairness-excellent text-white p-4">'}
          <br />
          {'  Excellent Score'}
          <br />
          {'</div>'}
        </code>
      </div>
    </div>
  )
}
