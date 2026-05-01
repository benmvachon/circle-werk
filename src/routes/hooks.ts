import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

export function useCircleId() {
  const { circleId } = useParams<{ circleId: string }>();
  return circleId;
}

export function useStoryId() {
  const { storyId } = useParams<{ storyId: string }>();
  return storyId;
}

export function useRoundParam() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get('round');
  return round ? parseInt(round, 10) : null;
}

export function useNavigateToCircle() {
  const navigate = useNavigate();
  return (circleId: string) => navigate(`/circles/${circleId}`);
}

export function useNavigateToStory() {
  const navigate = useNavigate();
  return (storyId: string, round?: number) => {
    const url = `/stories/${storyId}`;
    if (round !== undefined) {
      navigate(`${url}?round=${round}`);
    } else {
      navigate(url);
    }
  };
}

export function useNavigateToAssignments() {
  const navigate = useNavigate();
  return () => navigate('/assignments');
}
