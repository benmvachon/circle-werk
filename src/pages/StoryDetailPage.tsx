import { useParams, useSearchParams, Link } from 'react-router-dom';

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [searchParams] = useSearchParams();
  const round = searchParams.get('round');

  return (
    <div>
      <h1>Story Details</h1>
      <p>Story ID: {storyId}</p>
      {round && <p>Viewing Round: {round}</p>}
      <Link to="/circles">Back to Circles</Link>
    </div>
  );
}
