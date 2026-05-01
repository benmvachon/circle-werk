import { useParams, Link } from 'react-router-dom';

export function CircleDetailPage() {
  const { circleId } = useParams<{ circleId: string }>();

  return (
    <div className="circle-detail-page">
      <h1>Circle Details</h1>
      <p>Circle ID: {circleId}</p>
      <Link to="/circles">Back to Circles</Link>
    </div>
  );
}
