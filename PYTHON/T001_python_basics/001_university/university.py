

class University():
	def __init__(self, name):
		self.name = name;
		self.departments = [];

	def addDepartment(self, dept):
		self.departments.append(dept);

	def Print(self):
		print("University: ", self.name);
		for dept in self.departments:
			dept.Print();
