import './ExploreContainer.css';

interface ContainerProps {
  name: string;
  size : number;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name, size }) => {
  return (
    <div className="container">
      <strong>{name}</strong>
      <div>
        Size: { size }
      </div>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
    </div>
  );
};

export default ExploreContainer;
